# TempShare

TempShare is a Python web app that allows users to share files temporarily within a local network. Files are stored temporarily and are automatically removed when users disconnect or when the server stops.

## Features

- Real-time file sharing within local network
- Material Design UI
- QR code generation for easy sharing
- File upload with extension validation
- Real-time updates using WebSocket
- Temporary file storage
- Download functionality for all users
- Share via link or QR code

## Prerequisites

- Python 3.x
- pip (Python package installer)

## Technologies Used

- **Flask**: Backend web framework
- **Flask-SocketIO**: Real-time WebSocket communication
- **QRCode**: QR code generation for sharing
- **Pillow**: Image processing for QR codes
- **Material Icons**: UI icons from Google
- **WebSockets**: Real-time updates

## Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tempshare.git
   cd TempShare
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   - On Linux/macOS:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     .\venv\Scripts\activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

# Note : Before running the app, you might have to create a directory/folder called 'uploads' in the root directory/folder of the project, if the app doesn't create it on its own when running. The QR code and all shared files are stored there during the session.

5. Run the application:
   ```bash
   python app.py
   ```

6. Access the application:
   - Open a web browser and navigate to `http://localhost:5000`
   - For local network access, use the IP address shown in the console

## Project Structure

```
tempshare/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css     # Application styling
│   └── js/
│       └── app.js        # Client-side JavaScript
├── templates/
│   ├── base.html         # Base template with common structure
│   └── index.html        # Main HTML template
└── uploads/              # Temporary file storage
```

## How It Works

1. The application creates a local server accessible within your network
2. Files uploaded are stored temporarily in the `uploads` directory
3. Real-time updates are handled through WebSocket connections
4. Files can be shared via direct link or QR code
5. Files are automatically cleaned up when:
   - Users manually delete them
   - The server stops
   - All users disconnect

## Security Notes

- The application is designed for local network use
- Files are stored temporarily and are not persisted
- File extensions are validated before upload
- No session data is stored
