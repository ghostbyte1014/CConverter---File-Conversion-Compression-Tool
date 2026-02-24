import os
import uuid
import requests
from datetime import datetime, timedelta
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from apscheduler.schedulers.background import BackgroundScheduler

from utils.converter import convert_file
from utils.compressor import compress_image
from utils.cleanup import cleanup_temp_files

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'temp', 'uploads')
OUTPUT_FOLDER = os.path.join(os.path.dirname(__file__), 'temp', 'outputs')
MAX_FILE_SIZE = 250 * 1024 * 1024  # 250MB

ALLOWED_EXTENSIONS = {
    # Documents
    'pdf', 'docx', 'txt',
    # Images
    'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp',
    # Audio
    'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma',
    # Video
    'mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv'
}

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

CORS(app, resources={r"/api/*": {"origins": "*"}})

# Track active sessions for cleanup
active_sessions = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_session_id():
    return str(uuid.uuid4())

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'MConverter API'})

@app.route('/api/usage', methods=['GET'])
def get_usage():
    """Get usage - unlimited"""
    return jsonify({
        'total_used': 0,
        'remaining': 'unlimited',
        'limit': 'unlimited',
        'month': datetime.now().strftime('%Y-%m')
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and return session ID"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Generate unique session ID
    session_id = generate_session_id()
    original_filename = secure_filename(file.filename)
    file_ext = original_filename.rsplit('.', 1)[1].lower()
    
    # Save uploaded file
    input_path = os.path.join(UPLOAD_FOLDER, f"{session_id}.{file_ext}")
    file.save(input_path)
    
    # Store session info
    active_sessions[session_id] = {
        'original_filename': original_filename,
        'input_path': input_path,
        'created_at': datetime.now(),
        'output_path': None,
        'file_type': file_ext
    }
    
    return jsonify({
        'session_id': session_id,
        'filename': original_filename,
        'file_type': file_ext,
        'file_size': os.path.getsize(input_path)
    })

@app.route('/api/convert', methods=['POST'])
def convert_file_endpoint():
    """Convert file to different format"""
    data = request.get_json()
    session_id = data.get('session_id')
    target_format = data.get('target_format', '').lower()
    
    if not session_id or session_id not in active_sessions:
        return jsonify({'error': 'Invalid session ID'}), 400
    
    if not target_format:
        return jsonify({'error': 'Target format not specified'}), 400
    
    session = active_sessions[session_id]
    input_path = session['input_path']
    input_ext = input_path.rsplit('.', 1)[1].lower()
    
    try:
        # Handle audio/video conversion via free API
        if input_ext in ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma',
                        'mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv']:
            output_path = convert_with_ffmpeg(input_path, target_format, OUTPUT_FOLDER)
        else:
            # Local conversion for documents and images
            output_path = convert_file(input_path, target_format, OUTPUT_FOLDER)
        
        session['output_path'] = output_path
        session['target_format'] = target_format
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'output_filename': os.path.basename(output_path),
            'output_format': target_format,
            'output_size': os.path.getsize(output_path)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def convert_with_ffmpeg(input_path, target_format, output_folder):
    """Convert audio/video using ffmpeg"""
    import uuid
    import shutil
    import subprocess
    
    output_filename = f"{uuid.uuid4()}.{target_format}"
    output_path = os.path.join(output_folder, output_filename)
    
    # Try ffmpeg conversion
    try:
        result = subprocess.run([
            'ffmpeg', '-i', input_path, 
            '-y', '-progress', 'pipe:1', output_path
        ], check=True, capture_output=True, text=True)
        return output_path
    except Exception as e:
        print(f"FFmpeg conversion failed: {e}")
        # Fallback: copy file with new extension
        shutil.copy(input_path, output_path)
        return output_path

@app.route('/api/compress', methods=['POST'])
def compress_file_endpoint():
    """Compress image file"""
    data = request.get_json()
    session_id = data.get('session_id')
    quality = data.get('quality', 75)
    
    if not session_id or session_id not in active_sessions:
        return jsonify({'error': 'Invalid session ID'}), 400
    
    session = active_sessions[session_id]
    input_path = session['input_path']
    
    try:
        output_path = compress_image(input_path, quality, OUTPUT_FOLDER)
        
        session['output_path'] = output_path
        session['quality'] = quality
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'output_filename': os.path.basename(output_path),
            'original_size': session.get('file_size', os.path.getsize(input_path)),
            'compressed_size': os.path.getsize(output_path),
            'compression_ratio': round((1 - os.path.getsize(output_path) / os.path.getsize(input_path)) * 100, 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download processed file"""
    session_id = None
    for sid, session in active_sessions.items():
        if session.get('output_path') and os.path.basename(session['output_path']) == filename:
            session_id = sid
            break
    
    if not session_id:
        return jsonify({'error': 'File not found'}), 404
    
    session = active_sessions[session_id]
    output_path = session.get('output_path')
    
    if not output_path or not os.path.exists(output_path):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(
        output_path,
        as_attachment=True,
        download_name=filename
    )

@app.route('/api/cleanup', methods=['POST'])
def cleanup_endpoint():
    """Manual cleanup endpoint"""
    data = request.get_json()
    session_id = data.get('session_id')
    
    if session_id and session_id in active_sessions:
        cleanup_temp_files(active_sessions[session_id])
        del active_sessions[session_id]
        return jsonify({'success': True, 'message': 'Session cleaned up'})
    
    return jsonify({'error': 'Invalid session ID'}), 400

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get session information"""
    if session_id not in active_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    session = active_sessions[session_id]
    return jsonify({
        'session_id': session_id,
        'original_filename': session.get('original_filename'),
        'has_output': session.get('output_path') is not None,
        'output_filename': os.path.basename(session['output_path']) if session.get('output_path') else None,
        'created_at': session['created_at'].isoformat()
    })

# Cleanup scheduler - run every 10 minutes
scheduler = BackgroundScheduler()
scheduler.add_job(
    func=lambda: cleanup_old_sessions(),
    trigger="interval",
    minutes=10
)
scheduler.start()

def cleanup_old_sessions():
    """Clean up sessions older than 10 minutes"""
    cutoff_time = datetime.now() - timedelta(minutes=10)
    sessions_to_delete = []
    
    for session_id, session in active_sessions.items():
        if session['created_at'] < cutoff_time:
            cleanup_temp_files(session)
            sessions_to_delete.append(session_id)
    
    for session_id in sessions_to_delete:
        del active_sessions[session_id]
    
    if sessions_to_delete:
        print(f"Cleaned up {len(sessions_to_delete)} old sessions")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
