import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Image, Music, Video, AlertTriangle } from 'lucide-react'

function Home() {
  const tools = [
    {
      id: 'convert',
      title: 'Document Conversion',
      description: 'Convert text documents (PDF, DOCX, TXT)',
      icon: <FileText className="w-12 h-12" />,
      color: 'bg-gray-700',
      href: '/convert',
      badge: 'Text Only'
    },
    {
      id: 'image-convert',
      title: 'Image Conversion',
      description: 'Convert images (PNG, JPG, WebP, GIF, BMP)',
      icon: <Image className="w-12 h-12" />,
      color: 'bg-gray-600',
      href: '/convert'
    },
    {
      id: 'compress',
      title: 'Image Compression',
      description: 'Reduce image file size while maintaining quality',
      icon: <Image className="w-12 h-12" />,
      color: 'bg-gray-500',
      href: '/compress'
    },
    {
      id: 'audio',
      title: 'Audio Conversion',
      description: 'Convert audio files (MP3, WAV, OGG, FLAC, M4A)',
      icon: <Music className="w-12 h-12" />,
      color: 'bg-gray-400',
      href: '/convert'
    },
    {
      id: 'video',
      title: 'Video Conversion',
      description: 'Convert video files (MP4, AVI, MOV, MKV, WEBM)',
      icon: <Video className="w-12 h-12" />,
      color: 'bg-gray-300',
      href: '/convert'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-100">CConverter</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">
            Convert & Compress Your Files
          </h2>
          <p className="text-gray-400 text-lg">
            Professional tools for documents, images, audio, and video
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.href}
              className="block"
            >
              <div className="bg-gray-800 rounded-2xl p-6 shadow-sm card-hover border border-gray-700 h-full hover:border-gray-500 transition-colors">
                <div className={`${tool.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4`}>
                  {tool.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-100">
                    {tool.title}
                  </h3>
                  {tool.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-900 text-amber-200 rounded-full">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mb-4">
                  {tool.description}
                </p>
                <div className="flex items-center text-gray-300 font-medium">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-amber-900/30 border border-amber-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-200 mb-1">Document Conversion Note</h4>
              <p className="text-amber-100/80 text-sm">
                Documents containing pictures/images may not convert accurately. 
                This tool is designed for <strong>text documents only</strong>. 
                For documents with images, please use separate image conversion tools.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-gray-100 mb-6 text-center">
            Why Use CConverter?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-100 mb-2">Secure</h4>
              <p className="text-gray-400 text-sm">
                Your files are automatically deleted after processing. No data is stored on our servers.
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-100 mb-2">Fast</h4>
              <p className="text-gray-400 text-sm">
                Process files quickly with high-quality conversion using advanced APIs.
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-100 mb-2">Mobile-Friendly</h4>
              <p className="text-gray-400 text-sm">
                Works perfectly on your phone or tablet. Install as a PWA for offline access.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 CConverter. All rights reserved.</p>
          <p className="mt-2">Files are automatically deleted after processing.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
