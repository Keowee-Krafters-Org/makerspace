/** 
 * A component that combines a label with another component 
 * This a superclass for components like TextInput and DropDown
 * It is not intended to be used directly.
 * 
 * Example usage: export class TextInput extends LabeledComponent { ... }
 */
import { Container } from "postcss";
import { Component } from "./Component.js";
import { Label } from "./Label.js";
import { Container   } from "./Container.js";   
export class LabeledComponent extends Container {
    /**
     * @param {string} id - The ID of the component.
     * @param {string} labelText - The text for the label.
     * @param {Component} input - The main component (e.g., an input or select element).
     * @param {string} className - The CSS class name(s) for styling the component.
     * @param {Function|null} onClick - Optional click event handler for the component.
     */
    constructor(id, labelText = '', input, className = 'labeled-component') {
        super(`${id}-container`, 'div', className);
        this.labelText = labelText;
        const label = new Label(`${this.id}-label`, this.labelText, id);
        this.container.appendChild(label);
        this.input = input;
        this.container.appendChild(input);
    }

    /**
     * Renders the LabeledComponent with its label.
     * @returns {HTMLDivElement} The container with the label and main element.
     */
    render() {
        
        // Return the container with the label and input
        return this.container.render();
    }
}