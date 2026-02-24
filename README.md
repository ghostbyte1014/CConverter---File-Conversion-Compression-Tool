# CConverter - File Conversion & Compression Tool

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue" alt="React">
  <img src="https://img.shields.io/badge/Flask-Python-green" alt="Flask">
  <img src="https://img.shields.io/badge/PWA-Ready-purple" alt="PWA">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

---

## 📱 App Description

**CConverter** is a powerful, mobile-friendly web application for converting and compressing files. Built with modern web technologies (React + Flask), it provides a seamless experience for users who need to convert documents, images, audio, and video files on the go.

### Key Features

| Feature | Description |
|---------|-------------|
| **Document Conversion** | Convert between PDF, DOCX, and TXT formats |
| **Image Conversion** | Convert between PNG, JPG, WebP, GIF, BMP |
| **Image Compression** | Reduce file size with adjustable quality |
| **Audio Conversion** | Convert between MP3, WAV, OGG, FLAC, M4A |
| **Video Conversion** | Convert between MP4, AVI, MOV, MKV, WEBM |
| **PWA Support** | Installable on mobile devices, works offline |
| **Privacy First** | Files auto-delete after processing |

### Who Is This For?

- 📄 **Students** converting assignment documents
- 📸 **Photographers** compressing images for web
- 🎵 **Content creators** converting media files
- 💼 **Professionals** needing quick file conversions
- 📱 **Mobile users** who need on-the-go conversions

---

## 🚀 Quick Start

### Local Development

```
bash
# Clone or download the project
cd cconverter

# Backend Setup
cd backend
pip install -r requirements.txt
python app.py

# Frontend Setup (new terminal)
cd frontend
npm install
npm run dev
```

Access at: **http://localhost:3000**

---

## ☁️ Deploy to Cloud

### Option 1: Vercel + Render (Recommended)

#### Backend → Render.com
1. Push code to GitHub
2. Create Web Service on render.com
3. Configure:
   - Build: `pip install -r requirements.txt`
   - Start: `python app.py`
4. Copy your backend URL

#### Frontend → Vercel
1. Update `frontend/.env.production` with your backend URL
2. Import repo on vercel.com
3. Set Root Directory: `frontend`
4. Deploy!

See README for detailed deployment guide.

---

## 🔧 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| PWA | Mobile Install |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Flask | Web Framework |
| Python 3 | Runtime |
| pdf2docx | PDF Conversion |
| python-docx | DOCX Handling |
| Pillow | Image Processing |
| ffmpeg | Audio/Video |

---

## 📂 Project Structure

```
cconverter/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── Procfile           # Render deployment
│   └── utils/             # Conversion utilities
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── App.jsx       # Main app
│   │   └── index.jsx     # Entry point
│   ├── package.json
│   ├── vite.config.js    # Vite + PWA config
│   └── .env.production   # Production config
└── README.md
```

---

## 📄 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/upload` | POST | Upload file |
| `/api/convert` | POST | Convert file |
| `/api/compress` | POST | Compress image |
| `/api/download/<filename>` | GET | Download result |
| `/api/cleanup` | POST | Clean up session |

---

## ⚠️ Important Notes

### Document Conversion
> Documents containing pictures/images may not convert accurately. This tool is designed for **text documents only**.

### File Size
- Maximum file size: **250MB**
- Files automatically deleted after **10 minutes**

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
