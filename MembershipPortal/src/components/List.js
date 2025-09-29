/**
 * Component to support rendering a list of items.
 */
import { Component } from "./Component.js";

export class List extends Component {
    /**
     * @param {string} id - The ID of the list element.
     * @param {Array} items - The array of items to be displayed in the list.
     * @param {string} classname - The CSS class name(s) for the list.
     * @param {Function|null} onClick - The click event handler for the list.
     */
    constructor(id, items = [], classname = 'custom-list', onClick = null) {
        super(id, 'ul', classname, onClick);
        this.items = items;
    }

    /**
     * Renders the List component.
     * @returns {HTMLUListElement} The rendered unordered list element.
     */
    render() {
        const list = super.render();
        this.items.forEach(item => {
            const listItem = document.createElement('li');
            if (item instanceof Component) {    
                listItem.appendChild(item.render());
            } else {
                listItem.textContent = item;
            }
            list.appendChild(listItem);
        });
        return list;
    }

    /**
     * Add an item to the list.
     * @param {string|Component} item - The item to be added to the list.
     */
    addItem(item) {
        this.items.push(item);
    }
    
    /**
     * Clear all items from the list.
     */
    clearItems() {
        this.items = [];
    }
    
    /**
     * Get all items in the list.
     * @returns {Array} The array of items in the list.
     */
    getItems() {
        return this.items;
    }
    
    /**
     * Set the items of the list.
     * @param {Array} items - The new array of items for the list.
     */
    setItems(items) {
        this.items = items;
    }
    
    /**
     * Get the number of items in the list.
     * @returns {number} The count of items in the list.
     */
    getItemCount() {
        return this.items.length;
    }
}