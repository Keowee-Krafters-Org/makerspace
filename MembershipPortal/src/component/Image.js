import { Component } from "./Component.js";

/**
 * Image class for creating reusable image components.
 */
export class Image extends Component {
    /**
     * @param {string} id - The ID of the image element.
     * @param {string} src - The source URL of the image.
     * @param {string} alt - The alt text for the image.
     * @param {string} className - The CSS class name(s) for styling the image.
     */
    constructor(id, src = '', alt = '', className = 'image-component') {
        super(id, 'img', className);
        this.src = src;
        this.alt = alt;
    }

    /**
     * Renders the Image component.
     * @returns {HTMLImageElement} The rendered image element.
     */
    render() {
        const img = super.render();
        img.src = this.src;
        img.alt = this.alt;
        return img;
    }

    /**
     * Updates the image source.
     * @param {string} newSrc - The new source URL for the image.
     */
    updateSrc(newSrc) {
        this.src = newSrc;
        this.component.src = newSrc;
    }
}