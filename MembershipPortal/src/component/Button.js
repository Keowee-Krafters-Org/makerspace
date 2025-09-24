import { Component } from "./Component.js";

/**
 * Button class for creating customizable button components.
 */
export class Button extends Component {
    /**
     * @param {string} id - The ID of the button element.
     * @param {string} label - The text label for the button.
     * @param {string} classname - The CSS class name(s) for the button.
     * @param {Function|null} onClick - The click event handler for the button.
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
     * Dynamically updates the button's click event handler.
     * @param {Function} onClick - The new click event handler.
     */
    setOnClick(onClick) {
        this.onClick = onClick;
        this.element.removeEventListener('click', this.onClick);
        this.element.addEventListener('click', this.onClick);
    }
}
