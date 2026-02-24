import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Upload, Image as ImageIcon, Download, ArrowLeft, Check, Loader2, Sliders } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function Compress() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [step, setStep] = useState('upload')
  const [selectedFile, setSelectedFile] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [quality, setQuality] = useState(75)
  const [outputFilename, setOutputFilename] = useState('')
  const [compressionResult, setCompressionResult] = useState(null)
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
      
      if (!['png', 'jpg', 'jpeg', 'webp'].includes(file_type)) {
        setError('Please upload an image file (PNG, JPG, WebP)')
        setLoading(false)
        return
      }

      setSelectedFile({ name: filename, size: response.data.file_size, type: file_type })
      setSessionId(session_id)
      setStep('settings')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  const handleCompress = async () => {
    if (!sessionId) return

    setError('')
    setLoading(true)
    setStep('processing')

    try {
      const response = await axios.post(`${API_BASE}/compress`, {
        session_id: sessionId,
        quality: quality
      })

      const { output_filename, original_size, compressed_size, compression_ratio } = response.data
      setOutputFilename(output_filename)
      setCompressionResult({
        originalSize: original_size,
        compressedSize: compressed_size,
        compressionRatio: compression_ratio
      })
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.error || 'Compression failed')
      setStep('settings')
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

  const handleNewCompression = () => {
    setStep('upload')
    setSelectedFile(null)
    setSessionId(null)
    setQuality(75)
    setOutputFilename('')
    setCompressionResult(null)
    setError('')
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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
            <h1 className="text-xl font-bold text-gray-100">Image Compression</h1>
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
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                Upload Your Image
              </h2>
              <p className="text-gray-400">
                Select an image to compress (PNG, JPG, WebP)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
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
                  Choose Image
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Maximum file size: 250MB
            </p>
          </div>
        )}

        {step === 'settings' && selectedFile && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-700">
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-700 rounded-xl">
              <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-100 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {formatSize(selectedFile.size)} • {selectedFile.type.toUpperCase()}
                </p>
              </div>
              <Check className="w-5 h-5 text-green-500" />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Compression Quality
                </h3>
                <span className="text-lg font-bold text-gray-300">{quality}%</span>
              </div>
              
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
              />
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {[25, 50, 75, 90].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      quality === q
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {q}%
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompress}
              disabled={loading}
              className="w-full py-4 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Compress Image
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
              Compressing Your Image
            </h2>
            <p className="text-gray-400">
              Reducing file size while maintaining quality
            </p>
          </div>
        )}

        {step === 'done' && compressionResult && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-700 text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100 mb-2">
              Compression Complete!
            </h2>
            
            <div className="bg-gray-700 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400">Original</p>
                  <p className="font-semibold text-gray-200">{formatSize(compressionResult.originalSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Compressed</p>
                  <p className="font-semibold text-green-400">{formatSize(compressionResult.compressedSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Saved</p>
                  <p className="font-semibold text-gray-300">{compressionResult.compressionRatio}%</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-4 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 flex items-center justify-center gap-2 mb-4"
            >
              <Download className="w-5 h-5" />
              Download Compressed Image
            </button>

            <button
              onClick={handleNewCompression}
              className="w-full py-4 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600"
            >
              Compress Another Image
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Compress
