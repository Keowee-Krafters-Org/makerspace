import { Component } from './Component.js';
import { Image } from './Image.js';

/**
 * FileUpload class for creating a file input with a preview.
 */
export class FileUpload extends Component {
    /**
     * @param {string} id - The ID of the file upload element.
     * @param {string} previewUrl - The initial URL for the preview image.
     * @param {string} className - The CSS class name(s) for styling the file upload.
     * @param {string} accept - The accepted file types (e.g., 'image/*').
     */
    constructor(id, previewUrl = '', className = 'file-upload', accept = 'image/*') {
        super(id, 'div', className);
        this.previewUrl = previewUrl;
        this.accept = accept;
        this.fileBase64 = ''; // Store the base64 string of the uploaded file
    }

    /**
     * Renders the FileUpload component.
     * @returns {HTMLDivElement} The rendered file upload container.
     */
    render() {
        const container = super.render();
        container.className = 'file-upload-container';

        // Image preview
        const imagePreview = new Image(
            `${this.id}-preview`,
            this.previewUrl,
            'File Preview',
            'file-upload-preview'
        ).render();
        imagePreview.style.maxWidth = '200px';
        imagePreview.style.display = this.previewUrl ? 'block' : 'none';
        container.appendChild(imagePreview);

        // File input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = `${this.id}-input`;
        fileInput.accept = this.accept;
        container.appendChild(fileInput);

        // Handle file selection and preview
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    this.fileBase64 = e.target.result; // Store the base64 string
                };
                reader.readAsDataURL(file);
            }
        });

        return container;
    }

    /**
     * Gets the base64 string of the uploaded file.
     * @returns {string} The base64 string of the uploaded file.
     */
    getFileBase64() {
        return this.fileBase64;
    }
}