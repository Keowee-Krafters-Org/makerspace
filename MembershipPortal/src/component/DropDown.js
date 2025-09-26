import { Component } from './Component.js';
import { Label } from './Label.js';

/**
 * DropDown class for creating reusable dropdown components with an optional label.
 */
export class DropDown extends Component {
    /**
     * @param {string} id - The ID of the dropdown element.
     * @param {Array} options - The options for the dropdown. Each option can be a string or an object with `id` and `name`.
     * @param {string} selectedValue - The value of the selected option.
     * @param {string} className - The CSS class name(s) for styling the dropdown.
     * @param {string} labelText - The text for the label associated with the dropdown.
     */
    constructor(id, labelText = '', options = [], selectedValue = '', className = 'dropdown') {
        super(id, 'select', className);
        this.options = options;
        this.selectedValue = selectedValue;
        this.labelText = labelText;
    }

    /**
     * Renders the DropDown component with an optional label.
     * @returns {HTMLDivElement} The container with the label and dropdown.
     */
    render() {
        // Create a container for the label and dropdown
        const container = document.createElement('div');
        container.className = 'dropdown-container';

        // Add the label if labelText is provided
        if (this.labelText) {
            const label = new Label(this.id+'-label', this.labelText, this.id).render();
            container.appendChild(label);
        }

        // Render the dropdown
        const select = super.render();

        // Populate the dropdown with options
        this.options.forEach(option => {
            const value = typeof option === 'object' ? (option.id || option.name) : option;
            const label = typeof option === 'object' ? option.name : option;

            const optionElement = document.createElement('option');
            optionElement.value = value;
            optionElement.textContent = label;

            if (value === this.selectedValue) {
                optionElement.selected = true;
            }

            select.appendChild(optionElement);
        });

        container.appendChild(select);
        return container;
    }
}