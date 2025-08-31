/**
 * Invoice class representing an invoice with line items, total amount, and other details.
 * Extends the base Entity class for common entity functionality.
 * @extends Entity
 * @property {string} id - Unique identifier for the invoice
 * @property {Array} lineItems - List of line items in the invoice
 * @property {number} totalAmount - Total amount for the invoice
 * @property {string} status - Status of the invoice (e.g., "PAID", "UNPAID")
 * @property {Date} dueDate - Due date for the invoice
 */
class Invoice extends Entity {
    constructor(data = {}) {
        super(data);
        this.lineItems = Array.isArray(data.lineItems) ? data.lineItems : [];
        this.totalAmount = data.totalAmount || 0;
        this.status = data.status || 'UNPAID';
        this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    /**
     * Factory method for creating a fully initialized new Invoice.
     * Ensures required fields like lineItems and totalAmount have sensible defaults.
     * @param {Object} data - Source object for initialization
     * @returns {Invoice}
     */
    static createNew(data = {}) {
        return new this({
            ...data,
            lineItems: Array.isArray(data.lineItems) ? data.lineItems : [],
            totalAmount: data.totalAmount || 0,
            status: data.status || 'UNPAID',
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
        });
    }

    /**
     * Adds a line item to the invoice.
     * @param {Object} lineItem - The line item to add
     */
    addLineItem(lineItem) {
        if (!lineItem || typeof lineItem !== 'object') {
            throw new Error('Line item must be a valid object.');
        }
        this.lineItems.push(lineItem);
        this.calculateTotal();
    }

    /**
     * Removes a line item from the invoice.
     * @param {Object} lineItem - The line item to remove
     */
    removeLineItem(lineItem) {
        this.lineItems = this.lineItems.filter(item => item !== lineItem);
        this.calculateTotal();
    }

    /**
     * Calculates the total amount for the invoice based on its line items.
     */
    calculateTotal() {
        this.totalAmount = this.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    }

    /**
     * Sets the status of the invoice.
     * @param {string} status - The new status (e.g., "PAID", "UNPAID")
     */
    setStatus(status) {
        if (typeof status !== 'string') {
            throw new Error('Status must be a string.');
        }
        this.status = status;
    }

    /**
     * Sets the due date for the invoice.
     * @param {Date|string} dueDate - The due date
     */
    setDueDate(dueDate) {
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid due date.');
        }
        this.dueDate = date;
    }

    /**
     * Converts the invoice to a plain object for serialization.
     * @returns {Object}
     */
    toObject() {
        return {
            ...this,
            totalAmount: this.totalAmount,
            status: this.status,
            dueDate: this.dueDate,
        };
    }

    /**
     * Returns a string representation of the invoice.
     * @returns {string}
     */
    toString() {
        return `Invoice ${this.id || ''} - Total: $${this.totalAmount.toFixed(2)} - Status: ${this.status}`;
    }
}

// Make the class globally accessible in Google Apps Script
this.Invoice = Invoice;