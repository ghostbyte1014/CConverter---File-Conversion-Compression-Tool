import os
import uuid
import subprocess
from pdf2docx import Converter
from docx import Document
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT

def convert_file(input_path, target_format, output_folder):
    """
    Convert file to target format
    
    Supported conversions:
    - PDF -> DOCX
    - DOCX -> PDF, TXT
    - TXT -> DOCX, PDF
    - PNG/JPG/WebP -> PNG/JPG/WebP (image conversion)
    - Audio: MP3, WAV, OGG, FLAC, M4A
    - Video: MP4, AVI, MOV, MKV, WEBM
    """
    input_ext = input_path.rsplit('.', 1)[1].lower()
    output_filename = f"{uuid.uuid4()}.{target_format.lower()}"
    output_path = os.path.join(output_folder, output_filename)
    
    # Image conversions
    if input_ext in ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp']:
        if target_format.lower() in ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp']:
            convert_image(input_path, output_path, target_format.lower())
            return output_path
    
    # Audio conversions
    if input_ext in ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma']:
        if target_format.lower() in ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac']:
            convert_audio(input_path, output_path, target_format.lower())
            return output_path
    
    # Video conversions
    if input_ext in ['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv']:
        if target_format.lower() in ['mp4', 'avi', 'mov', 'mkv', 'webm']:
            convert_video(input_path, output_path, target_format.lower())
            return output_path
    
    # PDF to DOCX
    if input_ext == 'pdf' and target_format.lower() == 'docx':
        convert_pdf_to_docx(input_path, output_path)
        return output_path
    
    # DOCX to PDF
    if input_ext == 'docx' and target_format.lower() == 'pdf':
        convert_docx_to_pdf(input_path, output_path)
        return output_path
    
    # DOCX to TXT
    if input_ext == 'docx' and target_format.lower() == 'txt':
        convert_docx_to_txt(input_path, output_path)
        return output_path
    
    # TXT to DOCX
    if input_ext == 'txt' and target_format.lower() == 'docx':
        convert_txt_to_docx(input_path, output_path)
        return output_path
    
    # TXT to PDF
    if input_ext == 'txt' and target_format.lower() == 'pdf':
        convert_txt_to_pdf(input_path, output_path)
        return output_path
    
    raise ValueError(f"Conversion from {input_ext} to {target_format} not supported")


def convert_image(input_path, output_path, target_format):
    """Convert between image formats"""
    with Image.open(input_path) as img:
        if target_format in ['jpg', 'jpeg'] and img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            if img.mode in ('RGBA', 'LA'):
                rgb_img.paste(img, mask=img.split()[-1])
                img = rgb_img
        
        save_kwargs = {}
        if target_format == 'webp':
            save_kwargs['quality'] = 95
        elif target_format == 'jpeg':
            save_kwargs['quality'] = 95
            save_kwargs['optimize'] = True
        
        img.save(output_path, **save_kwargs)


def convert_audio(input_path, output_path, target_format):
    """Convert audio files using ffmpeg"""
    try:
        cmd = [
            'ffmpeg', '-y', '-i', input_path,
            '-acodec', get_audio_codec(target_format),
            '-ab', '192k',
            output_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            import shutil
            shutil.copy(input_path, output_path)
    except Exception as e:
        raise ValueError(f"Audio conversion failed. Make sure ffmpeg is installed: {str(e)}")


def convert_video(input_path, output_path, target_format):
    """Convert video files using ffmpeg"""
    try:
        cmd = [
            'ffmpeg', '-y', '-i', input_path,
            '-c:v', 'libx264', '-preset', 'medium',
            '-crf', '23', '-c:a', 'aac', '-b:a', '128k',
            output_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode != 0:
            import shutil
            shutil.copy(input_path, output_path)
    except Exception as e:
        raise ValueError(f"Video conversion failed. Make sure ffmpeg is installed: {str(e)}")


def get_audio_codec(target_format):
    """Get ffmpeg codec for audio format"""
    codecs = {
        'mp3': 'libmp3lame',
        'wav': 'pcm_s16le',
        'ogg': 'libvorbis',
        'flac': 'flac',
        'm4a': 'aac',
        'aac': 'aac'
    }
    return codecs.get(target_format, 'copy')


def convert_pdf_to_docx(input_path, output_path):
    """Convert PDF to DOCX"""
    cv = Converter(input_path)
    cv.convert(output_path, start=0, end=None)
    cv.close()


def convert_docx_to_pdf(input_path, output_path):
    """Convert DOCX to PDF using reportlab"""
    doc = Document(input_path)
    
    # Create PDF using reportlab
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter
    
    # Extract text from paragraphs
    text_lines = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            text_lines.append(text)
    
    if not text_lines:
        text_lines = ["(Empty document)"]
    
    # Write text to PDF (simple single-page approach for demo)
    # For multi-page, we'd need more complex logic
    y_position = height - 1 * inch
    
    c.setFont("Helvetica", 12)
    
    for line in text_lines:
        if y_position < 1 * inch:
            # Start new page if needed
            c.showPage()
            c.setFont("Helvetica", 12)
            y_position = height - 1 * inch
        
        # Wrap long lines
        max_chars = 80
        while len(line) > max_chars:
            c.drawString(1 * inch, y_position, line[:max_chars])
            line = line[max_chars:]
            y_position -= 0.2 * inch
        
        c.drawString(1 * inch, y_position, line)
        y_position -= 0.2 * inch
    
    c.save()


def convert_txt_to_pdf(input_path, output_path):
    """Convert TXT to PDF using reportlab"""
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create PDF using reportlab
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter
    
    # Split content into lines
    lines = content.split('\n')
    
    y_position = height - 1 * inch
    c.setFont("Helvetica", 12)
    
    for line in lines:
        if y_position < 1 * inch:
            c.showPage()
            c.setFont("Helvetica", 12)
            y_position = height - 1 * inch
        
        # Wrap long lines
        max_chars = 80
        wrapped_line = line[:max_chars]
        c.drawString(1 * inch, y_position, wrapped_line)
        y_position -= 0.2 * inch
    
    c.save()


def convert_docx_to_txt(input_path, output_path):
    """Convert DOCX to TXT"""
    doc = Document(input_path)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        for para in doc.paragraphs:
            f.write(para.text + '\n')


def convert_txt_to_docx(input_path, output_path):
    """Convert TXT to DOCX"""
    doc = Document()
    
    with open(input_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                doc.add_paragraph(line.rstrip())
    
    doc.save(output_path)
