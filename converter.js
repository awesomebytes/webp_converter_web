document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const output = document.getElementById('output');

    // Quality sliders and values
    const qualitySliders = document.getElementById('quality-sliders');
    const jpegQualitySlider = document.getElementById('jpeg-quality-slider');
    const jpegQualityValue = document.getElementById('jpeg-quality-value');
    const webpQualitySlider = document.getElementById('webp-quality-slider');
    const webpQualityValue = document.getElementById('webp-quality-value');

    // Variables to store image data
    let originalImage = null;
    let originalFilename = '';
    let originalSize = 0;

    // Update quality value display and regenerate images on slider input
    jpegQualitySlider.addEventListener('input', function() {
        jpegQualityValue.textContent = jpegQualitySlider.value;
        if (originalImage) {
            processImage();
        }
    });

    webpQualitySlider.addEventListener('input', function() {
        webpQualityValue.textContent = webpQualitySlider.value;
        if (originalImage) {
            processImage();
        }
    });

    // Click to open file dialog
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag over effects
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('hover');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.classList.remove('hover');
    });

    // Handle dropped files
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('hover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        if (fileInput.files.length > 0) {
            handleFile(fileInput.files[0]);
        }
    });

    // Function to handle file input
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.onload = function() {
                originalFilename = file.name;
                originalSize = file.size;
                qualitySliders.style.display = 'block'; // Show quality sliders
                processImage();
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Function to process and convert the image
    function processImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);

        // Get the selected qualities
        const jpegQuality = parseFloat(jpegQualitySlider.value);
        const webpQuality = parseFloat(webpQualitySlider.value);

        // Convert to JPG, PNG, and WebP with adjusted quality
        const jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        const pngDataUrl = canvas.toDataURL('image/png');
        const webpDataUrl = canvas.toDataURL('image/webp', webpQuality);

        // Calculate sizes
        const jpegSize = approximateDataUrlSize(jpegDataUrl);
        const pngSize = approximateDataUrlSize(pngDataUrl);
        const webpSize = approximateDataUrlSize(webpDataUrl);

        // Display download links
        output.innerHTML = `
            <div id="download-links">
                <h2>Download Converted Images:</h2>
                <a href="${jpegDataUrl}" download="converted.jpg">Download JPG (${formatBytes(jpegSize)})</a>
                <a href="${pngDataUrl}" download="converted.png">Download PNG (${formatBytes(pngSize)})</a>
                <a href="${webpDataUrl}" download="converted.webp">Download WebP (${formatBytes(webpSize)})</a>
            </div>
        `;

        // Display side-by-side comparison
        output.innerHTML += `
            <h2>Image Comparison:</h2>
            <div id="comparison-container">
                <div class="image-container">
                    <img src="${originalImage.src}" alt="Original Image">
                    <p>Original (${originalFilename})<br>${formatBytes(originalSize)}</p>
                </div>
                <div class="image-container">
                    <img src="${jpegDataUrl}" alt="Converted JPG">
                    <p>JPG Image<br>${formatBytes(jpegSize)}</p>
                </div>
                <div class="image-container">
                    <img src="${pngDataUrl}" alt="Converted PNG">
                    <p>PNG Image<br>${formatBytes(pngSize)}</p>
                </div>
                <div class="image-container">
                    <img src="${webpDataUrl}" alt="Converted WebP">
                    <p>WebP Image<br>${formatBytes(webpSize)}</p>
                </div>
            </div>
        `;
    }

    // Utility function to approximate Data URL size
    function approximateDataUrlSize(dataUrl) {
        // Remove the data URL prefix
        const base64String = dataUrl.split(',')[1];
        // Calculate the size in bytes
        return Math.round((base64String.length * 3) / 4);
    }

    // Utility function to format bytes as human-readable text
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024,
              dm = 2,
              sizes = ['Bytes', 'KB', 'MB', 'GB'],
              i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
});
