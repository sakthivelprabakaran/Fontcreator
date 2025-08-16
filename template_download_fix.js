
// Fixed Template Download Implementation

function downloadTemplate() {
    // Create SVG template programmatically
    const svgContent = createHandwritingTemplate();

    // Create blob and download
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'handwriting_template.svg';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(url);

    console.log('Template downloaded successfully');
}

function createHandwritingTemplate() {
    const width = 2100; // A4 width in pixels at 300 DPI
    const height = 2970; // A4 height in pixels at 300 DPI
    const cellSize = 120;
    const margin = 60;

    // Characters to include in template
    const characters = [
        // Uppercase letters
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z',
        // Lowercase letters
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z',
        // Numbers
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .grid-line { stroke: #e0e0e0; stroke-width: 1; fill: none; }
            .cell-border { stroke: #333; stroke-width: 2; fill: none; }
            .character-label { font-family: Arial, sans-serif; font-size: 16px; fill: #666; text-anchor: middle; }
            .title { font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; fill: #333; text-anchor: middle; }
            .instructions { font-family: Arial, sans-serif; font-size: 14px; fill: #666; }
        </style>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="white"/>

    <!-- Title -->
    <text x="${width/2}" y="40" class="title">Handwriting Template for Font Generation</text>

    <!-- Instructions -->
    <text x="${margin}" y="80" class="instructions">Instructions: Write each character clearly in black ink within the boxes below.</text>
    <text x="${margin}" y="100" class="instructions">Keep characters centered and avoid touching the box borders.</text>

`;

    let x = margin;
    let y = 140;
    const cellsPerRow = Math.floor((width - 2 * margin) / cellSize);

    characters.forEach((char, index) => {
        if (index > 0 && index % cellsPerRow === 0) {
            x = margin;
            y += cellSize + 20;
        }

        // Draw cell border
        svgContent += `    <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" class="cell-border"/>\n`;

        // Add character label below the box
        svgContent += `    <text x="${x + cellSize/2}" y="${y + cellSize + 15}" class="character-label">${char}</text>\n`;

        // Add light grid lines inside the cell for guidance
        svgContent += `    <line x1="${x + cellSize/2}" y1="${y}" x2="${x + cellSize/2}" y2="${y + cellSize}" class="grid-line"/>\n`;
        svgContent += `    <line x1="${x}" y1="${y + cellSize/2}" x2="${x + cellSize}" y2="${y + cellSize/2}" class="grid-line"/>\n`;

        x += cellSize + 10;
    });

    svgContent += '</svg>';

    return svgContent;
}

// Alternative PDF template download
function downloadPDFTemplate() {
    // For PDF generation, we can use jsPDF or create a backend endpoint
    // This is a placeholder that would call a backend API

    fetch('/api/generate-template', {
        method: 'GET',
        headers: {
            'Accept': 'application/pdf'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Template generation failed');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'handwriting_template.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error downloading PDF template:', error);
        // Fallback to SVG template
        downloadTemplate();
    });
}
