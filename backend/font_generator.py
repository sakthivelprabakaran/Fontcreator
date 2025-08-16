import logging
import os
import subprocess
import uuid
import cv2
import numpy as np
import fontforge

# Define the character set in the order they appear on the template
# This is crucial for correctly mapping segmented images to characters.
CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
EXPECTED_CHAR_COUNT = len(CHARACTERS)

def generate_font_from_image(image_path):
    """
    Main function to generate a font from a handwriting template image.
    Orchestrates the entire pipeline from image to .ttf file.
    """
    logging.info(f"Starting font generation for: {image_path}")

    # Create a unique directory for this processing job to avoid file collisions
    job_id = str(uuid.uuid4())
    temp_dir = os.path.join('backend', 'temp', job_id)
    os.makedirs(temp_dir, exist_ok=True)

    output_filename = f"font_{job_id}.ttf"
    output_path = os.path.join('backend/generated_fonts', output_filename)

    try:
        # 1. Preprocess the image
        preprocessed_image = preprocess_image(image_path)
        if preprocessed_image is None:
            raise ValueError("Image could not be loaded or preprocessed.")
        logging.info("Image preprocessed successfully.")

        # 2. Segment characters from the image
        character_images = segment_characters(preprocessed_image)
        if not character_images:
            raise ValueError("Could not segment characters from the image.")
        logging.info(f"Segmented {len(character_images)} characters.")

        # 3. Create the font file from the character images
        create_font_from_characters(character_images, temp_dir, output_path)
        logging.info(f"Font successfully created at: {output_path}")

        return output_path

    except Exception as e:
        logging.error(f"An error occurred during font generation: {e}")
        # In case of error, return None or re-raise
        raise
    finally:
        # 4. Clean up temporary files
        import shutil
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        logging.info(f"Cleaned up temporary directory: {temp_dir}")


def preprocess_image(image_path):
    """
    Loads an image, converts it to grayscale, and applies thresholding.
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None

    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(img, (5, 5), 0)

    # Use adaptive thresholding to get a clean binary image
    # This is better than a simple global threshold for varying lighting
    binary_img = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, 11, 2
    )

    return binary_img


def segment_characters(binary_image):
    """
    Finds character boxes in the image, sorts them, and extracts each character.
    """
    # Find contours in the image
    contours, _ = cv2.findContours(binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Filter contours to find potential character boxes
    char_boxes = []
    h, w = binary_image.shape
    min_area = (w * h) * 0.001 # Heuristic: min area for a char box
    max_area = (w * h) * 0.05  # Heuristic: max area

    for contour in contours:
        x, y, w_box, h_box = cv2.boundingRect(contour)
        area = w_box * h_box
        aspect_ratio = w_box / float(h_box)

        # Check if the contour is roughly square and within area limits
        if min_area < area < max_area and 0.5 < aspect_ratio < 2.0:
            char_boxes.append((x, y, w_box, h_box))

    # If we don't find enough boxes, something went wrong
    if len(char_boxes) < EXPECTED_CHAR_COUNT * 0.8: # Allow for some misses
        logging.warning(f"Found only {len(char_boxes)} contours, expected around {EXPECTED_CHAR_COUNT}.")
        # Fallback or error
        return []

    # Sort the character boxes by their position (top-to-bottom, left-to-right)
    # This is a critical step to map them to the correct characters.
    char_boxes.sort(key=lambda b: (b[1] // 100, b[0])) # Group by row, then sort by column

    # Extract the image for each character
    character_images = []
    for (x, y, w_box, h_box) in char_boxes:
        # Add a small margin around the character
        margin = 5
        char_img = binary_image[y-margin:y+h_box+margin, x-margin:x+w_box+margin]
        character_images.append(char_img)

    return character_images[:EXPECTED_CHAR_COUNT] # Return only the expected number

def create_font_from_characters(character_images, temp_dir, output_font_path):
    """
    Uses FontForge and Potrace to create a .ttf font from character images.
    """
    font = fontforge.font()
    font.fontname = "MyHandwritingFont"
    font.familyname = "My Handwriting Font"
    font.fullname = "My Handwriting Font"

    for i, char_img in enumerate(character_images):
        char = CHARACTERS[i]

        # 1. Save the character image as a temporary bitmap file
        bmp_path = os.path.join(temp_dir, f"char_{i}.bmp")
        cv2.imwrite(bmp_path, char_img)

        # 2. Vectorize the bitmap using potrace (BMP to SVG)
        svg_path = os.path.join(temp_dir, f"char_{i}.svg")
        subprocess.run(
            ["potrace", bmp_path, "-s", "-o", svg_path],
            check=True
        )

        # 3. Create a glyph in the font and import the SVG
        glyph = font.createChar(ord(char))
        glyph.importOutlines(svg_path)

        # Clean up temporary files for this character
        os.remove(bmp_path)
        os.remove(svg_path)

    # 4. Generate the final TTF font file
    font.generate(output_font_path)
    logging.info(f"Font generated at {output_font_path}")
