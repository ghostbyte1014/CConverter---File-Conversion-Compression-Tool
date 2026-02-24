import os
import shutil

def cleanup_temp_files(session):
    """
    Clean up temporary files for a session
    
    Args:
        session: Session dictionary containing 'input_path' and 'output_path'
    """
    # Clean up input file
    if session.get('input_path') and os.path.exists(session['input_path']):
        try:
            os.remove(session['input_path'])
            print(f"Removed input file: {session['input_path']}")
        except Exception as e:
            print(f"Error removing input file: {e}")
    
    # Clean up output file
    if session.get('output_path') and os.path.exists(session['output_path']):
        try:
            os.remove(session['output_path'])
            print(f"Removed output file: {session['output_path']}")
        except Exception as e:
            print(f"Error removing output file: {e}")


def cleanup_all_temp_files(upload_folder, output_folder):
    """
    Clean up all temporary files in upload and output folders
    
    Args:
        upload_folder: Path to uploads folder
        output_folder: Path to outputs folder
    """
    # Clean up uploads folder
    if os.path.exists(upload_folder):
        try:
            shutil.rmtree(upload_folder)
            os.makedirs(upload_folder)
            print(f"Cleaned uploads folder: {upload_folder}")
        except Exception as e:
            print(f"Error cleaning uploads folder: {e}")
    
    # Clean up outputs folder
    if os.path.exists(output_folder):
        try:
            shutil.rmtree(output_folder)
            os.makedirs(output_folder)
            print(f"Cleaned outputs folder: {output_folder}")
        except Exception as e:
            print(f"Error cleaning outputs folder: {e}")


def get_temp_folder_size(upload_folder, output_folder):
    """
    Get total size of temporary files
    
    Args:
        upload_folder: Path to uploads folder
        output_folder: Path to outputs folder
    
    Returns:
        Total size in bytes
    """
    total_size = 0
    
    for folder in [upload_folder, output_folder]:
        if os.path.exists(folder):
            for dirpath, dirnames, filenames in os.walk(folder):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    if os.path.exists(filepath):
                        total_size += os.path.getsize(filepath)
    
    return total_size


def format_size(size_bytes):
    """Format bytes to human readable string"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"
