import { showSpinner, hideSpinner    } from "./common";

/**
 * Base class for different document elements eg: portals, components, etc.
 */
export class Container {
    constructor(divId = null) {
        if (!divId) {
            this.div = document.createElement('div');
        } else {
            // If a divId is provided, use the existing div
            this.divId = divId;
            this.div = document.getElementById(this.divId);
        }
       
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