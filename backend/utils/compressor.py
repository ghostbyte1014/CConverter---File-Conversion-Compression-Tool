import os
import uuid
from PIL import Image

def compress_image(input_path, quality, output_folder):
    """
    Compress image with specified quality level
    
    Args:
        input_path: Path to input image
        quality: Compression quality (1-100)
        output_folder: Output directory path
    
    Returns:
        Path to compressed image
    """
    input_ext = input_path.rsplit('.', 1)[1].lower()
    output_filename = f"{uuid.uuid4()}.{input_ext}"
    output_path = os.path.join(output_folder, output_filename)
    
    with Image.open(input_path) as img:
        # Handle different image modes
        if img.mode in ('RGBA', 'LA', 'P') and input_ext in ['jpg', 'jpeg']:
            # Convert palette mode to RGBA first, then to RGB for JPEG
            if img.mode == 'P':
                img = img.convert('RGBA')
            # Now handle RGBA/LA to RGB conversion
            if img.mode in ('RGBA', 'LA'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[-1])
                img = rgb_img
        
        # Get original size
        original_size = os.path.getsize(input_path)
        
        # Save with compression
        save_kwargs = {
            'quality': quality,
            'optimize': True
        }
        
        if input_ext in ['png']:
            # PNG compression
            save_kwargs['optimize'] = True
            if quality < 70:
                save_kwargs['compress_level'] = 9
            else:
                save_kwargs['compress_level'] = 6
        elif input_ext in ['jpg', 'jpeg']:
            # JPEG optimization - ensure RGB mode
            save_kwargs['optimize'] = True
            save_kwargs['subsampling'] = '4:2:0'
            # Convert to RGB if not already (handles P mode from quality < 50)
            if img.mode != 'RGB':
                img = img.convert('RGB')
        
        img.save(output_path, **save_kwargs)
        
        # If output is larger than input, just copy original
        if os.path.getsize(output_path) >= original_size:
            import shutil
            shutil.copy(input_path, output_path)
    
    return output_path


def get_image_info(input_path):
    """Get image information (dimensions, format, size)"""
    with Image.open(input_path) as img:
        return {
            'width': img.width,
            'height': img.height,
            'format': img.format,
            'mode': img.mode,
            'size_bytes': os.path.getsize(input_path)
        }


def resize_image(input_path, max_width, max_height, output_folder):
    """
    Resize image to fit within max dimensions while maintaining aspect ratio
    
    Args:
        input_path: Path to input image
        max_width: Maximum width
        max_height: Maximum height
        output_folder: Output directory path
    
    Returns:
        Path to resized image
    """
    input_ext = input_path.rsplit('.', 1)[1].lower()
    output_filename = f"{uuid.uuid4()}.{input_ext}"
    output_path = os.path.join(output_folder, output_filename)
    
    with Image.open(input_path) as img:
        # Calculate new dimensions while maintaining aspect ratio
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        img.save(output_path, optimize=True)
    
    return output_path
