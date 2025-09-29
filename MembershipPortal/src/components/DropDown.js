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
    constructor(id, labelText = '', 
        options = [], 
        selectedValue = '', 
        className = 'dropdown',
        itemLoader = null) {
        super(id, 'select', className);
        this.options = options;
        this.selectedValue = selectedValue;
        this.labelText = labelText;
        this.itemLoader = itemLoader; // Function to load items dynamically
    }

    /**
     * Renders the DropDown component with an optional label.
     * @returns {HTMLDivElement} The container with the label and dropdown.
     */
    render() {
        // Create a container for the label and dropdown
        const container = document.createElement('div');
        container.className = 'dropdown-container';

        
        container.appendChild(this.element);
        return container;
    }



      /**
     * Populates the dropdown with the current options.
     * @param {HTMLSelectElement} select - The select element to populate.
     */
    populateOptions(options) {
        // Clear existing options
        const select = this.element;
        select.innerHTML = '';

        // Add new options
        this.options.forEach((option) => {
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
    }

    /**
     * Set the onChange event handler for the dropdown.
     * @param {Function} onChange - The function to be called when the dropdown value changes.
     */
    setOnChange(onChange) {
        
        this.element.onchange = onChange;
       
    }   
    /** 
     * Set the options for the dropdown.
     * @param {Array} options - The new array of options for the dropdown.
     */
    setOptions(options) {
        this.options = options;
        this.populateOptions();
    }

    /**
     * Get the currently selected value of the dropdown.
     * @returns {string} The value of the selected option.
     */
    getSelectedValue() {
        return this.selectedValue;
    }

    /**
     * Set the selected value of the dropdown.
     * @param {string} value - The value to be selected.
     */
    setSelectedValue(value) {
        this.selectedValue = value;
    }

    /**
     * Get the options of the dropdown.
     * @returns {Array} The array of options for the dropdown.
     */
    getOptions() {
        return this.options;
    }
    
    /**
     * Get the number of options in the dropdown.
     * @returns {number} The count of options in the dropdown.
     */
    getOptionCount() {
        return this.options.length;
    }
    
    /**
     * Clear all options from the dropdown.
     */
    clearOptions() {
        this.options = [];
    }
    
    /**
     * Add an option to the dropdown.
     * @param {string|Object} option - The option to be added. Can be a string or an object with `id` and `name`.
     */
    addOption(option) {
        this.options.push(option);
    }
    
    /**
     * Remove an option from the dropdown by value.
     * @param {string} value - The value of the option to be removed.
     */
    removeOptionByValue(value) {
        this.options = this.options.filter(option => {
            const optionValue = typeof option === 'object' ? (option.id || option.name) : option;
            return optionValue !== value;
        });
    }
    
    /**
     * Remove an option from the dropdown by index.
     * @param {number} index - The index of the option to be removed.
     */
    removeOptionByIndex(index) {
        if (index >= 0 && index < this.options.length) {
            this.options.splice(index, 1);
        } else {
            console.warn(`Index ${index} is out of bounds.`);
        }
    }
    
    /**
     * Get an option by its index.
     * @param {number} index - The index of the option to retrieve.
     * @returns {string|Object|null} The option at the specified index or null if out of bounds.
     */
    getOptionByIndex(index) {
        if (index >= 0 && index < this.options.length) {
            return this.options[index];
        } else {
            console.warn(`Index ${index} is out of bounds.`);
            return null;
        }
    }
    
    /**
     * Get an option by its value.
     * @param {string} value - The value of the option to retrieve.
     * @returns {string|Object|null} The option with the specified value or null if not found.      
     */
    getOptionByValue(value) {
        for (const option of this.options) {
            const optionValue = typeof option === 'object' ? (option.id || option.name) : option;
            if (optionValue === value) {
                return option;
            }
        }
        console.warn(`Option with value ${value} not found.`);
        return null;
    }
}