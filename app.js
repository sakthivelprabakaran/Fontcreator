// Global variables
let uploadedImage = null;
let processingSteps = [
    { name: "Image Preprocessing", duration: 3000, icon: "⚙️" },
    { name: "Character Segmentation", duration: 7000, icon: "🔍" },
    { name: "Vectorization", duration: 12000, icon: "📐" },
    { name: "Font Generation", duration: 6000, icon: "🔤" }
];
let currentZoom = 1;
let processingStartTime = null;

// Character sets for template generation
const characters = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    punctuation: '.,!?\'-"'
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeUpload();
    initializeFontPreview();
    populateCharacterGrid();
    console.log('Application initialized');
});

// Initialize all event listeners
function initializeEventListeners() {
    // Navigation buttons
    const getStartedBtn = document.getElementById('getStartedBtn');
    const seeDemoBtn = document.getElementById('seeDemoBtn');
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('templates');
        });
    }
    
    if (seeDemoBtn) {
        seeDemoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showDemo();
        });
    }
    
    // Template download buttons
    const downloadSVGBtn = document.getElementById('downloadSVGBtn');
    const downloadPDFBtn = document.getElementById('downloadPDFBtn');
    
    if (downloadSVGBtn) {
        downloadSVGBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadSVGTemplate();
        });
    }
    
    if (downloadPDFBtn) {
        downloadPDFBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadPDFTemplate();
        });
    }
    
    // Upload and processing buttons
    const processBtn = document.getElementById('processBtn');
    const cancelProcessingBtn = document.getElementById('cancelProcessingBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const removeImageBtn = document.getElementById('removeImageBtn');
    
    if (processBtn) {
        processBtn.addEventListener('click', function(e) {
            e.preventDefault();
            startProcessing();
        });
    }
    
    if (cancelProcessingBtn) {
        cancelProcessingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cancelProcessing();
        });
    }
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            zoomImage(0.1);
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            zoomImage(-0.1);
        });
    }
    
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            resetUpload();
        });
    }
    
    // Results buttons
    const downloadTTFBtn = document.getElementById('downloadTTFBtn');
    const downloadOTFBtn = document.getElementById('downloadOTFBtn');
    const createAnotherBtn = document.getElementById('createAnotherBtn');
    
    if (downloadTTFBtn) {
        downloadTTFBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadFont();
        });
    }
    
    if (downloadOTFBtn) {
        downloadOTFBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadFontOTF();
        });
    }
    
    if (createAnotherBtn) {
        createAnotherBtn.addEventListener('click', function(e) {
            e.preventDefault();
            createAnotherFont();
        });
    }
    
    // FAQ event listeners
    initializeFAQ();
}

// Initialize FAQ functionality
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-item__question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function(e) {
            e.preventDefault();
            toggleFAQ(this);
        });
    });
}

// Smooth scrolling to sections
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        showNotification(`Navigated to ${sectionId} section`, 'info');
    }
}

// Template download functions
function downloadSVGTemplate() {
    showNotification('Generating SVG template...', 'info');
    fetch('/api/download-svg-template')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'handwriting-template.svg';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showNotification('SVG template downloaded successfully!', 'success');
        })
        .catch(error => {
            console.error('Error downloading SVG template:', error);
            showNotification('Error generating template. Please try again later.', 'error');
        });
}

function downloadPDFTemplate() {
    showNotification('Generating PDF template...', 'info');
    fetch('/api/download-pdf-template')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'handwriting-template.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showNotification('PDF template downloaded successfully!', 'success');
        })
        .catch(error => {
            console.error('Error downloading PDF template:', error);
            showNotification('Error generating template. Please try again later.', 'error');
        });
}

// File upload handling
function initializeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && fileInput) {
        // Click to upload
        uploadArea.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
        
        // File input change
        fileInput.addEventListener('change', handleFileSelect);
        
        // Drag and drop events
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleFileDrop);
        
        // Make upload area focusable
        uploadArea.setAttribute('tabindex', '0');
        uploadArea.setAttribute('role', 'button');
        uploadArea.setAttribute('aria-label', 'Click to upload handwriting image');
        
        // Keyboard support
        uploadArea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showNotification('Please upload a PNG, JPG, or JPEG file.', 'error');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }
    
    showNotification('Loading image...', 'info');
    
    // Read and display the file
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = e.target.result;
        displayUploadedImage(uploadedImage);
    };
    reader.readAsDataURL(file);
}

function displayUploadedImage(imageSrc) {
    const uploadArea = document.getElementById('uploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    
    if (uploadArea && uploadPreview && previewImage) {
        previewImage.src = imageSrc;
        uploadArea.style.display = 'none';
        uploadPreview.classList.remove('hidden');
        
        // Reset zoom
        currentZoom = 1;
        previewImage.style.transform = `scale(${currentZoom})`;
        
        showNotification('Image uploaded successfully! You can now process it.', 'success');
    }
}

function resetUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && uploadPreview && fileInput) {
        uploadedImage = null;
        fileInput.value = '';
        uploadArea.style.display = 'block';
        uploadPreview.classList.add('hidden');
        
        showNotification('Image removed.', 'info');
    }
}

function zoomImage(delta) {
    const previewImage = document.getElementById('previewImage');
    if (previewImage) {
        currentZoom = Math.max(0.5, Math.min(3, currentZoom + delta));
        previewImage.style.transform = `scale(${currentZoom})`;
        showNotification(`Zoom: ${Math.round(currentZoom * 100)}%`, 'info');
    }
}

// Demo functionality
function showDemo() {
    showNotification('Starting demo process...', 'info');
    
    // Create a demo image
    const demoImageSrc = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="white"/>
            <rect x="50" y="50" width="100" height="100" fill="none" stroke="black" stroke-width="2"/>
            <text x="100" y="110" text-anchor="middle" font-size="48" fill="black">A</text>
            <rect x="200" y="50" width="100" height="100" fill="none" stroke="black" stroke-width="2"/>
            <text x="250" y="110" text-anchor="middle" font-size="48" fill="black">B</text>
            <rect x="350" y="50" width="100" height="100" fill="none" stroke="black" stroke-width="2"/>
            <text x="400" y="110" text-anchor="middle" font-size="48" fill="black">C</text>
            <text x="400" y="250" text-anchor="middle" font-size="24" fill="gray">Demo Handwriting Sample</text>
        </svg>
    `);
    
    setTimeout(() => {
        uploadedImage = demoImageSrc;
        displayUploadedImage(demoImageSrc);
        scrollToSection('upload');
        
        setTimeout(() => {
            startProcessing();
        }, 2000);
    }, 1000);
}

// Real processing function
async function startProcessing() {
    if (!uploadedImage) {
        showNotification('Please upload an image first.', 'error');
        return;
    }

    // Hide upload section and show processing
    const uploadSection = document.getElementById('upload');
    const processingSection = document.getElementById('processing');
    
    uploadSection.classList.add('hidden');
    processingSection.classList.remove('hidden');
    scrollToSection('processing');
    showNotification('Processing started... This may take a minute.', 'info');
    
    // For simplicity, we'll use a generic loading message instead of the multi-step progress bar.
    // The multi-step progress bar can be re-integrated later with a more advanced backend (e.g., using WebSockets or polling).
    document.getElementById('progressPercent').textContent = 'Processing...';
    document.getElementById('progressFill').style.width = '50%'; // Indeterminate progress
    document.getElementById('processing-steps').style.display = 'none'; // Hide the detailed steps

    try {
        // Convert data URL to Blob
        const fetchRes = await fetch(uploadedImage);
        const blob = await fetchRes.blob();
        
        // Create FormData and append the image
        const formData = new FormData();
        formData.append('image', blob, 'handwriting.png');

        // Make the API call
        const response = await fetch('/api/process-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Processing failed');
        }

        const result = await response.json();

        // Update the download button to link to the real font file
        const downloadTTFBtn = document.getElementById('downloadTTFBtn');
        downloadTTFBtn.dataset.fontUrl = result.font_url; // Store the URL

        // The OTF button is not supported by the backend right now, so we'll disable it.
        const downloadOTFBtn = document.getElementById('downloadOTFBtn');
        downloadOTFBtn.disabled = true;
        downloadOTFBtn.title = "OTF format is not currently supported.";

        // Show the results section
        processingSection.classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');
        scrollToSection('results');
        showNotification('Font generated successfully!', 'success');

    } catch (error) {
        console.error('Error during processing:', error);
        showNotification(`An error occurred: ${error.message}`, 'error');
        // Reset to upload section
        processingSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
    }
}

function cancelProcessing() {
    const processingSection = document.getElementById('processing');
    const uploadSection = document.getElementById('upload');
    
    if (processingSection && uploadSection) {
        processingSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        scrollToSection('upload');
        showNotification('Processing cancelled.', 'info');
    }
}

// Font preview functionality
function initializeFontPreview() {
    const previewText = document.getElementById('previewText');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    
    if (previewText) previewText.addEventListener('input', updateFontPreview);
    if (fontSizeSlider) fontSizeSlider.addEventListener('input', updateFontPreview);
}

function updateFontPreview() {
    const previewTextInput = document.getElementById('previewText');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeLabel = document.getElementById('fontSizeLabel');
    const fontPreviewDisplay = document.getElementById('fontPreviewDisplay');
    
    if (previewTextInput && fontSizeSlider && fontSizeLabel && fontPreviewDisplay) {
        const previewText = previewTextInput.value;
        const fontSize = fontSizeSlider.value;
        
        fontSizeLabel.textContent = `${fontSize}px`;
        fontPreviewDisplay.textContent = previewText || 'Type your preview text...';
        fontPreviewDisplay.style.fontSize = `${fontSize}px`;
    }
}

function populateCharacterGrid() {
    const characterGrid = document.getElementById('characterGrid');
    if (!characterGrid) return;
    
    const allChars = characters.uppercase + characters.lowercase + characters.numbers + characters.punctuation;
    
    characterGrid.innerHTML = '';
    for (let char of allChars) {
        const charElement = document.createElement('div');
        charElement.className = 'character-preview';
        charElement.textContent = char;
        characterGrid.appendChild(charElement);
    }
}

// Font download functions
function downloadFont() {
    const downloadBtn = document.getElementById('downloadTTFBtn');
    const fontUrl = downloadBtn.dataset.fontUrl;
    
    if (fontUrl) {
        // Since the backend will provide the file, we can just link to it.
        // However, to control the filename, we'll fetch the blob and download it.
        showNotification('Preparing font for download...', 'info');
        fetch(fontUrl)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'my-handwriting-font.ttf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                showNotification('Font downloaded!', 'success');
            })
            .catch(err => {
                console.error('Download failed', err);
                showNotification('Could not download font.', 'error');
            });
    } else {
        showNotification('Font URL not found. Please process an image first.', 'error');
    }
}

function downloadFontOTF() {
    // This format is not supported by the backend in this version.
    showNotification('OTF format is not currently supported.', 'info');
}

function createAnotherFont() {
    // Reset the application state
    const resultsSection = document.getElementById('results');
    const uploadSection = document.getElementById('upload');
    
    if (resultsSection && uploadSection) {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        resetUpload();
        scrollToSection('upload');
        showNotification('Ready to create another font!', 'info');
    }
}

// FAQ functionality
function toggleFAQ(button) {
    const faqItem = button.closest('.faq-item');
    if (!faqItem) return;
    
    const isOpen = faqItem.classList.contains('open');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
    });
    
    // Open clicked item if it wasn't already open
    if (!isOpen) {
        faqItem.classList.add('open');
        showNotification('FAQ expanded', 'info');
    } else {
        showNotification('FAQ collapsed', 'info');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification status status--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        max-width: 300px;
        word-wrap: break-word;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modals or cancel operations
    if (e.key === 'Escape') {
        const processingSection = document.getElementById('processing');
        if (processingSection && !processingSection.classList.contains('hidden')) {
            cancelProcessing();
        }
    }
    
    // Ctrl/Cmd + Enter to start processing (if image is uploaded)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (uploadedImage) {
            const uploadSection = document.getElementById('upload');
            if (uploadSection && !uploadSection.classList.contains('hidden')) {
                startProcessing();
            }
        }
    }
});