document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const fileInput = document.getElementById('file-input');
    const filesList = document.getElementById('files-list');
    const shareLink = document.getElementById('share-link');
    const generateQR = document.getElementById('generate-qr');
    const qrModal = document.getElementById('qr-modal');
    const qrCode = document.getElementById('qr-code');
    const closeModal = document.querySelector('.close');

    // Load initial files
    fetch('/files')
        .then(response => response.json())
        .then(files => {
            files.forEach(filename => addFileToList(filename));
        });

    // File upload handling
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) {
                showFlashMessage(result.error || 'Error uploading file', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showFlashMessage('Error uploading file', 'error');
        }

        // Clear the input
        fileInput.value = '';
    });

    // Share link handling
    shareLink.addEventListener('click', async () => {
        const url = shareLink.dataset.url;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'TempShare',
                    text: 'Join my temporary file sharing session',
                    url: url
                });
            } else {
                await navigator.clipboard.writeText(url);
                showFlashMessage('Link copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Error:', error);
            showFlashMessage('Error sharing link', 'error');
        }
    });

    // QR code handling
    generateQR.addEventListener('click', async () => {
        try {
            const response = await fetch('/get-qr');
            const blob = await response.blob();
            qrCode.src = URL.createObjectURL(blob);
            qrModal.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            showFlashMessage('Error generating QR code', 'error');
        }
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        qrModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === qrModal) {
            qrModal.style.display = 'none';
        }
    });

    // Socket.io event handlers
    socket.on('file_added', (data) => {
        if (!document.querySelector(`[data-filename="${data.filename}"]`)) {
            addFileToList(data.filename);
        }
    });

    socket.on('file_removed', (data) => {
        const fileElement = document.querySelector(`[data-filename="${data.filename}"]`);
        if (fileElement) {
            fileElement.remove();
        }
    });

    // Helper function to add file to the list
    function addFileToList(filename) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.setAttribute('data-filename', filename);

        const fileName = document.createElement('span');
        fileName.className = 'file-name';
        fileName.textContent = filename;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-file';
        downloadButton.innerHTML = '<span class="material-icons">download</span>';
        downloadButton.onclick = () => downloadFile(filename);

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-file';
        removeButton.innerHTML = '<span class="material-icons">delete</span>';
        removeButton.onclick = () => removeFile(filename);

        buttonContainer.appendChild(downloadButton);
        buttonContainer.appendChild(removeButton);

        fileItem.appendChild(fileName);
        fileItem.appendChild(buttonContainer);
        filesList.appendChild(fileItem);
    }

    // Helper function to download file
    function downloadFile(filename) {
        window.location.href = `/download/${filename}`;
    }

    // Helper function to remove file
    async function removeFile(filename) {
        try {
            const response = await fetch(`/remove/${filename}`);
            if (!response.ok) {
                throw new Error('Failed to remove file');
            }
        } catch (error) {
            console.error('Error:', error);
            showFlashMessage('Error removing file', 'error');
        }
    }
});

// Helper functions
function showFlashMessage(message, type = 'info') {
    const flashContainer = document.querySelector('.flash-messages') || createFlashContainer();
    
    const messageElement = document.createElement('div');
    messageElement.className = `flash-message ${type}`;
    messageElement.textContent = message;
    
    flashContainer.appendChild(messageElement);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => messageElement.remove(), 300);
    }, 3000);
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-messages';
    document.body.appendChild(container);
    return container;
} 