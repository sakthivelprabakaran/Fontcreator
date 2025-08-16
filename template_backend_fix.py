
# Add this to the Flask backend (font_generator_backend.py)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from io import BytesIO

@app.route('/api/generate-template')
def generate_template():
    """Generate a handwriting template in PDF format"""
    try:
        # Create PDF in memory
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)

        # Page dimensions
        width, height = A4

        # Title
        p.setFont("Helvetica-Bold", 20)
        p.drawCentredText(width/2, height - 50, "Handwriting Template for Font Generation")

        # Instructions
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 80, "Instructions:")
        p.drawString(50, height - 95, "• Write each character clearly in black ink within the boxes")
        p.drawString(50, height - 110, "• Keep characters centered and avoid touching borders")
        p.drawString(50, height - 125, "• Use consistent letter size throughout")

        # Character grid
        characters = [
            # Uppercase
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
            'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z',
            # Lowercase  
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
            'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
            'u', 'v', 'w', 'x', 'y', 'z',
            # Numbers
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
        ]

        cell_size = 60
        cells_per_row = 8
        start_x = 50
        start_y = height - 160

        p.setFont("Helvetica", 10)

        for i, char in enumerate(characters):
            row = i // cells_per_row
            col = i % cells_per_row

            x = start_x + col * (cell_size + 10)
            y = start_y - row * (cell_size + 30)

            # Draw cell border
            p.rect(x, y - cell_size, cell_size, cell_size)

            # Add character label
            p.drawCentredText(x + cell_size/2, y - cell_size - 15, char)

            # Add light grid lines for guidance
            p.setStrokeColorRGB(0.8, 0.8, 0.8)
            p.line(x + cell_size/2, y - cell_size, x + cell_size/2, y)
            p.line(x, y - cell_size/2, x + cell_size, y - cell_size/2)
            p.setStrokeColorRGB(0, 0, 0)  # Reset to black

        # Save PDF
        p.save()
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='handwriting_template.pdf'
        )

    except Exception as e:
        logger.error(f"Template generation failed: {e}")
        return jsonify({'error': 'Template generation failed'}), 500

@app.route('/api/generate-svg-template')
def generate_svg_template():
    """Generate SVG template"""
    try:
        svg_content = create_svg_template()

        return Response(
            svg_content,
            mimetype='image/svg+xml',
            headers={
                'Content-Disposition': 'attachment; filename=handwriting_template.svg'
            }
        )

    except Exception as e:
        logger.error(f"SVG template generation failed: {e}")
        return jsonify({'error': 'SVG template generation failed'}), 500

def create_svg_template():
    """Create SVG template content"""
    width = 2100  # A4 width at 300 DPI
    height = 2970  # A4 height at 300 DPI

    characters = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ]

    svg_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .grid-line {{ stroke: #e0e0e0; stroke-width: 1; }}
            .cell-border {{ stroke: #333; stroke-width: 2; fill: none; }}
            .character-label {{ font-family: Arial; font-size: 16px; fill: #666; text-anchor: middle; }}
            .title {{ font-family: Arial; font-size: 24px; font-weight: bold; fill: #333; text-anchor: middle; }}
        </style>
    </defs>

    <rect width="{width}" height="{height}" fill="white"/>
    <text x="{width//2}" y="40" class="title">Handwriting Template</text>
"""

    cell_size = 120
    margin = 60
    cells_per_row = 10

    for i, char in enumerate(characters):
        row = i // cells_per_row
        col = i % cells_per_row

        x = margin + col * (cell_size + 10)
        y = 80 + row * (cell_size + 30)

        svg_content += f"""
    <rect x="{x}" y="{y}" width="{cell_size}" height="{cell_size}" class="cell-border"/>
    <text x="{x + cell_size//2}" y="{y + cell_size + 20}" class="character-label">{char}</text>
    <line x1="{x + cell_size//2}" y1="{y}" x2="{x + cell_size//2}" y2="{y + cell_size}" class="grid-line"/>
    <line x1="{x}" y1="{y + cell_size//2}" x2="{x + cell_size}" y2="{y + cell_size//2}" class="grid-line"/>
"""

    svg_content += "</svg>"
    return svg_content
