import { showSpinner, hideSpinner    } from "../common";

/**
 * Base class for different document elements eg: portals, components, etc.
 */
export class Container {
    constructor(id = null, type = 'div', className = 'container') {
        if (!id) {
            // Create a unique ID if none is provided
            this.id = `container-${Math.random().toString(36).substring(2, 9)}`;
        } else {
            // If a id is provided, use the existing div or create one
            this.id = id;
            this.div = document.getElementById(this.id);
            if (!this.div) {
                this.div = document.createElement(type);
            }   
        }
        this.div.className = className;
        document.body.appendChild(this.div);
        this.components = {}; // Store references to child components
    }
    /**
     * Initialize the component.
     */
    initialize() {
        showSpinner();
        return this;
    }

    complete() {
        hideSpinner();
        return this;
    }
    /**
     * Open the component.
     */
    open() {
        this.div.style.display = 'block';
        return this;
    }

    /**
     * Close the component.
     */
    close() {
        this.div.style.display = 'none';
        return this;
    }

    render() {
        return this.div;
    }

    appendChild(child) {
        this.components[child.id || child.div.id] = child;
        this.div.appendChild(child.render());
        return this;
    }

    clear() {
        this.div.innerHTML = '';
        return this;
    }
    setHtml(html) {
        this.div.innerHTML = html;
        return this;
    }
    setStyle(property, value) {
        this.div.style[property] = value;
        return this;
    }
}