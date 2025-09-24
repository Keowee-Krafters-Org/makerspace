import { Component } from "./Component.js";
import { Label } from "./Label.js";

/**
 * TextInput class for creating labeled text input fields.
 */
export class TextInput extends Component {
    /**
     * @param {string} id - The ID of the input element.
     * @param {string} label - The text for the label.
     * @param {string} inputType - The type of the input (e.g., 'text', 'password').
     * @param {string} value - The default value of the input.
     * @param {boolean} required - Whether the input is required.
     */
    constructor(id, label, inputType = 'text', value = '', required = false) {
        super(id, 'input', "text-input", null);
        this.id = id;
        this.label = label;
        this.inputType = inputType; // Renamed for consistency
        this.value = value;
        this.required = required;
    }

    /**
     * Renders the TextInput component as a labeled input field.
     * @returns {HTMLElement} The container element with the label and input field.
     */
    render() {
        // Create a container for the label and input
        const container = document.createElement('div');
        container.className = 'text-input-container';


        // Create the input element
        const input = document.createElement('input');
        input.type = this.inputType; // Use the corrected property name
        input.id = this.id;
        input.value = this.value;
        input.required = this.required;
        input.className = `text-input-field text-input-${this.inputType}`; // Add type-specific class

        // Create the label element
        const label = new Label(`${this.id}-label`, this.label).render();
        label.setAttribute('for', this.id); // Add accessibility

        // Append the label and input to the container
        container.appendChild(label);
        container.appendChild(input);

        return container;
    }
}
