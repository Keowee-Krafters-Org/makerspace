class LineItem extends Entity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || '';
    this.description = data.description || '';
    this.quantity = data.quantity || 1; // Default quantity to 1
    this.rate = data.rate || 0; // Default rate to 0
    this.amount = data.amount || 0; // Default amount to 0
  }

  /**
   * Factory method for creating a fully initialized new LineItem.
   * Ensures required fields like quantity, rate, and amount have sensible defaults.
   * @param {Object} data - Source object for initialization.
   * @returns {LineItem}
   */
  static createNew(data = {}) {
    return new this({
      ...data,
      quantity: data.quantity || 1,
      rate: data.rate || 0,
      amount: data.amount || 0,
    });
  }

  /**
   * Calculates the total amount for the line item based on quantity and rate.
   */
  calculateAmount() {
    this.amount = this.quantity * this.rate;
  }

  /**
   * Converts the line item to a plain object for serialization.
   * @returns {Object}
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      quantity: this.quantity,
      rate: this.rate,
      amount: this.amount,
    };
  }

  /**
   * Returns a string representation of the line item.
   * @returns {string}
   */
  toString() {
    return `${this.name} - Quantity: ${this.quantity}, Rate: $${this.rate.toFixed(2)}, Amount: $${this.amount.toFixed(2)}`;
  }
}