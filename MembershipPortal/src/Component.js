/**
 * Base class for different document elements eg: portals, components, etc.
 */
export class Component {
    constructor(divId = 'defaultDiv') {
        this.divId = divId;
    }
    /**
     * Initialize the component.
     */
    initialize() {
        
        this.div = document.getElementById(this.divId);
        this.div.innerHTML = `${this.name} Initializing...`;
        return this;
    }
    /**
     * Open the component.
     */
    open() {
        this.div.style.display = 'block';
    }

    /**
     * Close the component.
     */
    close() {
        this.div.style.display = 'none';
    }

}