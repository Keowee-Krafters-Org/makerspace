/**
 * A component to render a message box with customizable text and style.
 * 
 * Example usage:
 * const msg = new Message('msg1', 'This is an info message.', 'info-message');
 * document.body.appendChild(msg.render()); // Appends the message to the body
 */
import { Component } from "./Component.js";

export class Message extends Component {
    /**
     * @param {string} id - The ID of the message element.
     * @param {string} message - The text content of the message.
     * @param {string} className - The CSS class name(s) for styling the message.
     * @param {Function|null} onClick - Optional click event handler for the message.
     */
    constructor(id, message, className = "message", onClick = null) {
        super(id, 'div', className, onClick);
        this.message = message;
    }

    /**
     * Renders the Message component.
     * @returns {HTMLDivElement} The rendered message element.
     */
    render() {
        const messageDiv = super.render();
        messageDiv.textContent = this.message;
        return messageDiv;
    }
}
