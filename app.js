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
    try {
        showNotification('Generating SVG template...', 'info');
        
        setTimeout(() => {
            const svgContent = createHandwritingTemplate('svg');
            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'handwriting-template.svg';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL object
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            showNotification('SVG template downloaded successfully! Check your downloads folder.', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Error downloading SVG template:', error);
        showNotification('Error downloading template. Please try again.', 'error');
    }
}

function downloadPDFTemplate() {
    try {
        showNotification('Generating PDF-compatible template...', 'info');
        
        setTimeout(() => {
            // Create SVG with PDF-optimized settings
            const svgContent = createHandwritingTemplate('pdf');
            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'handwriting-template-for-pdf.svg';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            showNotification('Template downloaded! Open in browser and print to PDF, or use an online SVG to PDF converter.', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Error downloading PDF template:', error);
        showNotification('Error downloading template. Please try again.', 'error');
    }
}

function createHandwritingTemplate(format) {
    const allChars = characters.uppercase + characters.lowercase + characters.numbers + characters.punctuation;
    const cellSize = 120;
    const margin = 40;
    const cols = 10;
    const rows = Math.ceil(allChars.length / cols);
    
    const width = cols * cellSize + (cols + 1) * margin;
    const height = rows * cellSize + (rows + 1) * margin + 120; // Extra space for instructions
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .grid-line { stroke: #cccccc; stroke-width: 1; fill: none; }
            .cell-border { stroke: #666666; stroke-width: 2; fill: none; }
            .center-line { stroke: #dddddd; stroke-width: 1; stroke-dasharray: 5,5; }
            .instruction-text { font-family: Arial, sans-serif; font-size: 14px; fill: #333333; }
            .title-text { font-family: Arial, sans-serif; font-size: 18px; fill: #333333; font-weight: bold; }
            .character-label { font-family: Arial, sans-serif; font-size: 12px; fill: #999999; text-anchor: start; }
        </style>
    </defs>
    
    <!-- Background -->
    <rect width="${width}" height="${height}" fill="white" stroke="#000000" stroke-width="1"/>
    
    <!-- Title -->
    <text x="${width/2}" y="30" text-anchor="middle" class="title-text">
        Handwriting Font Template
    </text>
    
    <!-- Instructions -->
    <text x="${width/2}" y="55" text-anchor="middle" class="instruction-text">
        Write each character clearly in dark ink (black or blue) within the boxes below
    </text>
    <text x="${width/2}" y="75" text-anchor="middle" class="instruction-text">
        Keep characters centered and avoid touching the borders • Scan at 300+ DPI
    </text>
`;

    // Generate character cells
    for (let i = 0; i < allChars.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = margin + col * (cellSize + margin);
        const y = 100 + margin + row * (cellSize + margin);
        
        // Cell border
        svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" class="cell-border"/>`;
        
        // Center guidelines
        svgContent += `<line x1="${x + cellSize/2}" y1="${y + 10}" x2="${x + cellSize/2}" y2="${y + cellSize - 10}" class="center-line"/>`;
        svgContent += `<line x1="${x + 10}" y1="${y + cellSize/2}" x2="${x + cellSize - 10}" y2="${y + cellSize/2}" class="center-line"/>`;
        
        // Character label (small, in top-left corner)
        svgContent += `<text x="${x + 5}" y="${y + 15}" class="character-label">${allChars[i]}</text>`;
    }
    
    // Footer instructions
    const footerY = height - 40;
    svgContent += `<text x="${width/2}" y="${footerY}" text-anchor="middle" class="instruction-text">
        After filling out, scan and upload to generate your custom font
    </text>`;
    
    svgContent += '</svg>';
    
    return svgContent;
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

// Processing simulation
function startProcessing() {
    if (!uploadedImage) {
        showNotification('Please upload an image first.', 'error');
        return;
    }
    
    // Hide upload section and show processing
    const uploadSection = document.getElementById('upload');
    const processingSection = document.getElementById('processing');
    
    if (uploadSection && processingSection) {
        uploadSection.classList.add('hidden');
        processingSection.classList.remove('hidden');
        
        processingStartTime = Date.now();
        runProcessingSteps();
        
        // Scroll to processing section
        scrollToSection('processing');
        showNotification('Processing started...', 'info');
    }
}

function runProcessingSteps() {
    let totalDuration = processingSteps.reduce((sum, step) => sum + step.duration, 0);
    let currentTime = 0;
    
    processingSteps.forEach((step, index) => {
        setTimeout(() => {
            updateProcessingStep(index + 1, 'active');
            updateProgress(currentTime, totalDuration);
            
            setTimeout(() => {
                updateProcessingStep(index + 1, 'completed');
                currentTime += step.duration;
                updateProgress(currentTime, totalDuration);
                
                if (index === processingSteps.length - 1) {
                    setTimeout(() => completeProcessing(), 500);
                }
            }, step.duration);
        }, currentTime);
        
        currentTime += step.duration;
    });
}

function updateProcessingStep(stepNumber, status) {
    const step = document.getElementById(`step${stepNumber}`);
    if (!step) return;
    
    const statusElement = step.querySelector('.step-status');
    
    // Remove previous classes
    step.classList.remove('active', 'completed');
    
    if (status === 'active') {
        step.classList.add('active');
        if (statusElement) statusElement.textContent = 'Processing...';
    } else if (status === 'completed') {
        step.classList.add('completed');
        if (statusElement) statusElement.textContent = 'Completed ✓';
    }
}

function updateProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressTime = document.getElementById('progressTime');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressPercent) progressPercent.textContent = `${percentage}%`;
    
    if (progressTime) {
        const remaining = Math.max(0, total - current);
        const remainingSeconds = Math.round(remaining / 1000);
        progressTime.textContent = `Time remaining: ${remainingSeconds}s`;
    }
}

function completeProcessing() {
    const processingTime = Math.round((Date.now() - processingStartTime) / 1000);
    const processingTimeElement = document.getElementById('processingTime');
    if (processingTimeElement) {
        processingTimeElement.textContent = `${processingTime}s`;
    }
    
    const processingSection = document.getElementById('processing');
    const resultsSection = document.getElementById('results');
    
    if (processingSection && resultsSection) {
        processingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        scrollToSection('results');
        showNotification('Font generated successfully! You can now preview and download it.', 'success');
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
    showNotification('Generating TTF font file...', 'info');
    
    setTimeout(() => {
        const fontData = generateSimulatedFont('ttf');
        const blob = new Blob([fontData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-handwriting-font.ttf';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showNotification('TTF font downloaded successfully! Check your downloads folder.', 'success');
    }, 800);
}

function downloadFontOTF() {
    showNotification('Generating OTF font file...', 'info');
    
    setTimeout(() => {
        const fontData = generateSimulatedFont('otf');
        const blob = new Blob([fontData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-handwriting-font.otf';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showNotification('OTF font downloaded successfully! Check your downloads folder.', 'success');
    }, 800);
}

function generateSimulatedFont(format) {
    const header = format === 'ttf' ? 'TTF Font File' : 'OTF Font File';
    const timestamp = new Date().toISOString();
    const metadata = `${header}\n\nGenerated: ${timestamp}\nCharacters: 62\nFormat: ${format.toUpperCase()}\nFont Name: My Handwriting Font\n\n`;
    
    // Add some binary-like data to make it look more realistic
    const binaryData = new Array(1000).fill(0).map(() => 
        String.fromCharCode(Math.floor(Math.random() * 256))
    ).join('');
    
    return metadata + '[Font binary data]\n' + binaryData;
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