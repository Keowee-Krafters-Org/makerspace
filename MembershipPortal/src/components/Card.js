/**
 * Component for displaying a card style container. 
 */ 
import { Component } from "./Component.js";

export class Card extends Component {
    /**
     * @param {string} id - The ID of the card element.
     * @param {string} className - The CSS class name(s) for styling the card.
     * @param {Function|null} onClick - Optional click event handler for the card.
     */
    constructor(id, className = "card", onClick = null) {
        super(id, 'div', className, onClick);
    }

    /**
     * Renders the Card component.
     * @returns {HTMLDivElement} The rendered card element.
     */
    render() {
        return super.render();
    }
}