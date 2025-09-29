import { Component } from "./Component.js";

/**
 * Button class for creating customizable button components.
 */
export class Button extends Component {
    /**
     * @param {string} id - The ID of the button element.
     * @param {string} label - The text label for the button.
     * @param {Function|null} onClick - The click event handler for the button.
     * @param {string} classname - The CSS class name(s) for the button.
     * @param {Object} [ariaAttributes={}] - Optional accessibility attributes for the button.
     */
    constructor(id, label, onClick = null, classname = 'custom-button', ariaAttributes = {}) {
        super(id, 'button', classname, onClick);
        this.label = label;
        this.ariaAttributes = ariaAttributes; // Store accessibility attributes
    }

    /**
     * Renders the Button component.
     * @returns {HTMLButtonElement} The rendered button element.
     */
    render() {
        const button = super.render();
        button.textContent = this.label;

        // Add accessibility attributes
        for (const [key, value] of Object.entries(this.ariaAttributes)) {
            button.setAttribute(key, value);
        }

        return button;
    }

    /**
     * Binds the Button to an existing HTML element.
     * @param {HTMLElement} element - The existing HTML element to bind the button to.
     * @param {Function} onClick - The click event handler for the button.
     */
    bindToElement(element, onClick) {
        // Use the existing element properties if the instance properties are not set
        element.id = this.id || element.id; 
        element.className = this.classname || element.className;
        element.textContent = this.label || element.textContent;
        element.onclick = onClick;
    }
    /**
     * Binds the Button to an existing HTML element by its ID.
     * @param {string} elementId - The ID of the existing HTML element to bind the button to.
     * @param {Function} onClick - The click event handler for the button.
     */
    bindToElementId(elementId, onClick) {
        const element = document.getElementById(elementId);
        if (element) {
            this.bindToElement(element, onClick);
        } else {
            console.warn(`Element with ID ${elementId} not found.`);
        }
    }
}
