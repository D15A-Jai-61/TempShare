import os
import re
import qrcode
from flask import Flask, render_template, request, jsonify, send_file
from flask_socketio import SocketIO
from werkzeug.utils import secure_filename
import socket

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['UPLOAD_FOLDER'] = 'uploads'
socketio = SocketIO(app)

# Ensure upload directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Store files in memory (for temporary storage)
files = {}

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def is_valid_filename(filename):
    # Check if the filename has at least one dot and ends with an extension
    if '.' not in filename or filename.endswith('.'):
        return False
    
    # Split the filename into name and extension
    name_parts = filename.rsplit('.', 1)
    if len(name_parts) != 2:
        return False
    
    # Check if the extension contains only alphanumeric characters
    extension = name_parts[1]
    if not extension.isalnum():
        return False
    
    # Check if filename is not empty before the extension
    if not name_parts[0]:
        return False
    
    return True

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not is_valid_filename(file.filename):
        return jsonify({'error': 'Invalid filename'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    files[filename] = file_path
    socketio.emit('file_added', {'filename': filename})
    
    return jsonify({'message': 'File uploaded successfully', 'filename': filename})

@app.route('/files')
def list_files():
    return jsonify(list(files.keys()))

@app.route('/download/<filename>')
def download_file(filename):
    if filename in files:
        file_path = files[filename]
        try:
            return send_file(
                file_path,
                as_attachment=True,
                download_name=filename,
                mimetype='application/octet-stream'
            )
        except Exception as e:
            return jsonify({'error': 'Error downloading file'}), 500
    return jsonify({'error': 'File not found'}), 404

@app.route('/remove/<filename>')
def remove_file(filename):
    if filename in files:
        file_path = files[filename]
        if os.path.exists(file_path):
            os.remove(file_path)
        del files[filename]
        socketio.emit('file_removed', {'filename': filename})
        return jsonify({'message': 'File removed successfully'})
    return jsonify({'error': 'File not found'}), 404

@app.route('/get-qr')
def generate_qr():
    local_ip = get_local_ip()
    url = f'http://{local_ip}:5000'
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_qr.png')
    img.save(img_path)
    
    return send_file(img_path, mimetype='image/png')

@app.route('/get-url')
def get_url():
    local_ip = get_local_ip()
    return jsonify({'url': f'http://{local_ip}:5000'})

@app.route('/manifest.json')
def manifest():
    return app.send_static_file('manifest.json')

@app.route('/service-worker.js')
def service_worker():
    return app.send_static_file('service-worker.js')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True) 