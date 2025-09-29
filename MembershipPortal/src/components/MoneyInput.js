import { TextInput } from './TextInput.js';

/**
 * MoneyInput class for creating a text input specifically for monetary values.
 */
export class MoneyInput extends TextInput {
    /**
     * @param {string} id - The ID of the input element.
     * @param {number} value - The default value of the input.
     * @param {string} label - The text for the label.
     * @param {string} className - The CSS class name(s) for styling the input.
     */
    constructor(id, value = 0, label = 'Amount', className = 'money-input') {
        super(id, label, 'number', value, false, className);
        this.step = '0.01'; // Set the step for monetary values
    }

    /**
     * Renders the MoneyInput component.
     * @returns {HTMLInputElement} The rendered input element.
     */
    render() {
        const input = super.render();
        input.step = this.step; // Set the step attribute for monetary values
        return input;
    }
}