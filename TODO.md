# MConverter - Completed Project

## Project Overview
- **Project Name**: MConverter
- **Type**: PWA Web Application (React + Flask)
- **Core Functionality**: File conversion (documents, images, audio, video), image compression
- **Target Users**: Mobile and tablet users needing quick file conversions

---

## Completed Features

### Backend (Flask)
- ✅ Flask app with CORS support
- ✅ Temporary file storage with auto-cleanup
- ✅ Session management for unique file IDs
- ✅ Cleanup scheduler (10-minute timeout)
- ✅ API Endpoints:
  - POST /api/upload - File upload
  - POST /api/convert - File conversion (documents, images, audio, video)
  - POST /api/compress - Image compression
  - GET /api/download/<filename> - File download
  - POST /api/cleanup - Manual cleanup
  - GET /api/usage - Usage tracking

### Supported Conversions
- **Documents**: PDF ↔ DOCX, DOCX ↔ TXT, TXT ↔ DOCX
- **Images**: PNG ↔ JPG ↔ WebP, GIF, BMP
- **Audio**: MP3 ↔ WAV ↔ OGG ↔ FLAC ↔ M4A
- **Video**: MP4 ↔ AVI ↔ MOV ↔ MKV ↔ WEBM

### Frontend (React + PWA)
- ✅ Vite + React setup
- ✅ Tailwind CSS configuration
- ✅ React Router for navigation
- ✅ PWA Manifest for installability
- ✅ Service Worker with caching
- ✅ Pages:
  - Home Dashboard (File Conversion, Image Compression, Audio/Video conversion)
  - File Conversion Page
  - Image Compression Page

### Features
- ✅ File type validation
- ✅ File size limit (20MB)
- ✅ Upload progress indicator
- ✅ Error handling
- ✅ Download functionality
- ✅ Auto-cleanup after download
- ✅ Monthly usage tracking (45 free conversions)

---

## Technology Stack

### Backend
- Flask
- Flask-CORS
- pdf2docx
- python-docx
- Pillow
- requests (for external API calls)
- werkzeug
- SQLite (usage tracking)

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (icons)
- Vite PWA Plugin

---

## How to Run

### Backend
```
bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```
bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:3000
The API will run at http://localhost:5000
