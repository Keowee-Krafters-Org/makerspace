/** 
 * Component to display images in a carousel.    
 */
import { Component } from "./Component.js";
import { Button } from "./Button.js";
import { Label } from "./Label.js";
import { Card } from "./Card.js";
import { Image } from "./Image.js";
import { FileUpload } from "./FileUpload.js";
import "../style/imageViewer.css";

export class ImageViewer extends Card {
    /**
     * @param {string} id - The ID of the image viewer element.
     * @param {Array<string>} imageUrls - Array of image URLs to display.
     * @param {string} className - The CSS class name(s) for styling the image viewer.
     */
    constructor(id, imageUrls = [], className = "image-viewer-card") {
        super(id, className);
        this.imageUrls = imageUrls;
        this.currentIndex = 0;
    }

    /**
     * Initializes the ImageViewer by appending its elements to the Card.
     */
    initialize() {
        // Create the image element using the Image class
        this.imgElement = new Image(
            `${this.id}-img`,
            this.imageUrls[this.currentIndex] || '',
            `Image ${this.currentIndex + 1}`,
            'image-viewer-img'
        );
        this.appendChild(this.imgElement);

        // Create the label for the image index
        this.label = new Label(
            `Image ${this.currentIndex + 1} of ${this.imageUrls.length}`,
            `${this.id}-label`,
            'image-viewer-label'
        );
        this.appendChild(this.label);

        // Create navigation buttons
        const prevButton = new Button(
            `${this.id}-prev-btn`,
            '<',
            'image-viewer-prev-btn',
            () => this.showPreviousImage()
        );
        this.appendChild(prevButton);

        const nextButton = new Button(
            `${this.id}-next-btn`,
            '>',
            'image-viewer-next-btn',
            () => this.showNextImage()
        );
        this.appendChild(nextButton);
    }

    /**
     * Adds a FileUpload component to the ImageViewer.
     * @returns {FileUpload} The FileUpload component.
     */
    addFileUpload(previewUrl = '') {
        const fileUpload = new FileUpload(`${this.id}-file-upload`, previewUrl);
        this.appendChild(fileUpload);
        return fileUpload;
    }

    /**
     * Shows the previous image in the carousel.
     */
    showPreviousImage() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateImage();
        }
    }

    /**
     * Shows the next image in the carousel.
     */
    showNextImage() {
        if (this.currentIndex < this.imageUrls.length - 1) {
            this.currentIndex++;
            this.updateImage();
        }
    }

    /**
     * Updates the displayed image and label.
     */
    updateImage() {
        this.imgElement.updateSrc(this.imageUrls[this.currentIndex]);
        this.label.element.textContent = `Image ${this.currentIndex + 1} of ${this.imageUrls.length}`;
    }
}