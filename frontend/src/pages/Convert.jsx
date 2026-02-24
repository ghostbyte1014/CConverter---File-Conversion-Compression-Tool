import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Upload, FileDigit, Download, ArrowLeft, Check, Loader2, AlertTriangle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const conversionFormats = {
  // Documents - text only
  pdf: ['docx'],
  docx: ['pdf', 'txt'],
  txt: ['docx', 'pdf'],
  // Images
  png: ['jpg', 'webp'],
  jpg: ['png', 'webp'],
  webp: ['png', 'jpg'],
  jpeg: ['png', 'webp'],
  gif: ['png', 'jpg', 'webp'],
  bmp: ['png', 'jpg', 'webp'],
  // Audio
  mp3: ['wav', 'ogg', 'flac', 'm4a'],
  wav: ['mp3', 'ogg', 'flac'],
  ogg: ['mp3', 'wav', 'flac'],
  flac: ['mp3', 'wav', 'ogg'],
  m4a: ['mp3', 'wav', 'ogg'],
  aac: ['mp3', 'wav', 'ogg'],
  wma: ['mp3', 'wav'],
  // Video
  mp4: ['avi', 'mov', 'mkv', 'webm'],
  avi: ['mp4', 'mov', 'mkv', 'webm'],
  mov: ['mp4', 'avi', 'mkv', 'webm'],
  mkv: ['mp4', 'avi', 'mov', 'webm'],
  webm: ['mp4', 'avi', 'mov', 'mkv'],
  wmv: ['mp4', 'avi'],
  flv: ['mp4', 'avi']
}

// Check if file is a document type
const isDocument = (fileType) => {
  return ['pdf', 'docx', 'txt'].includes(fileType)
}

function Convert() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [step, setStep] = useState('upload')
  const [selectedFile, setSelectedFile] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [targetFormat, setTargetFormat] = useState('')
  const [availableFormats, setAvailableFormats] = useState([])
  const [outputFilename, setOutputFilename] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { session_id, file_type, filename } = response.data
      
      setSelectedFile({ name: filename, size: response.data.file_size, type: file_type })
      setSessionId(session_id)
      
      const formats = conversionFormats[file_type] || []
      setAvailableFormats(formats)
      
      if (formats.length > 0) {
        setTargetFormat(formats[0])
      }
      
      setStep('format')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async () => {
    if (!sessionId || !targetFormat) return

    setError('')
    setLoading(true)
    setStep('processing')

    try {
      const response = await axios.post(`${API_BASE}/convert`, {
        session_id: sessionId,
        target_format: targetFormat
      })

      const { output_filename } = response.data
      setOutputFilename(output_filename)
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.error || 'Conversion failed')
      setStep('format')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!outputFilename) return

    try {
      const response = await axios.get(`${API_BASE}/download/${outputFilename}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', outputFilename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      await axios.post(`${API_BASE}/cleanup`, { session_id: sessionId })
    } catch (err) {
      setError('Download failed')
    }
  }

  const handleNewConversion = () => {
    setStep('upload')
    setSelectedFile(null)
    setSessionId(null)
    setTargetFormat('')
    setOutputFilename('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-700 rounded-lg mr-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <h1 className="text-xl font-bold text-gray-100">File Conversion</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {step === 'upload' && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                Upload Your File
              </h2>
              <p className="text-gray-400">
                Select a document, image, audio, or video file to convert
              </p>
            </div>

            {/* Document Warning */}
            <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-200 mb-1">Important</h4>
                  <p className="text-amber-100/80 text-sm">
                    Documents containing pictures/images may not convert accurately. 
                    This tool is designed for <strong>text documents only</strong>.
                  </p>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,.gif,.bmp,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma,.mp4,.avi,.mov,.mkv,.webm,.wmv,.flv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full py-4 bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Choose File
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Maximum file size: 250MB
            </p>
          </div>
        )}

        {step === 'format' && selectedFile && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-700">
            {/* Document Warning for selected document */}
            {isDocument(selectedFile.type) && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-100/80 text-sm">
                    Converting text document. Images in documents may not appear in output.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-700 rounded-xl">
              <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
                <FileDigit className="w-6 h-6 text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-100 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.toUpperCase()}
                </p>
              </div>
              <Check className="w-5 h-5 text-green-500" />
            </div>

            <h3 className="font-medium text-gray-200 mb-3">Convert to:</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {availableFormats.map((format) => (
                <button
                  key={format}
                  onClick={() => setTargetFormat(format)}
                  className={`py-3 px-4 rounded-xl font-medium border-2 transition-colors ${
                    targetFormat === format
                      ? 'border-gray-500 bg-gray-600 text-white'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleConvert}
              disabled={loading || !targetFormat}
              className="w-full py-4 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileDigit className="w-5 h-5" />
                  Convert File
                </>
              )}
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-700 text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-gray-300 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100 mb-2">
              Processing Your File
            </h2>
            <p className="text-gray-400">
              Converting {selectedFile?.name} to {targetFormat.toUpperCase()}
            </p>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-700 text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100 mb-2">
              Conversion Complete!
            </h2>
            <p className="text-gray-400 mb-6">
              Your file has been converted successfully
            </p>

            <button
              onClick={handleDownload}
              className="w-full py-4 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 flex items-center justify-center gap-2 mb-4"
            >
              <Download className="w-5 h-5" />
              Download {outputFilename.split('.').pop().toUpperCase()}
            </button>

            <button
              onClick={handleNewConversion}
              className="w-full py-4 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600"
            >
              Convert Another File
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Convert
