class ZohoLineItem extends LineItem {
  constructor(data = {}) {
    super(data);
  }

  /**
   * Returns the singular resource name for Zoho Line Items.
   * @returns {string}
   */
  static getResourceNameSingular() {
    return 'line_item';
  }

  /**
   * Returns the plural resource name for Zoho Line Items.
   * @returns {string}
   */
  static getResourceNamePlural() {
    return 'line_items';
  }

  /**
   * Returns the mapping for converting Zoho API records to ZohoLineItem objects.
   * @returns {Object}
   */
  static getToRecordMap() {
    return {
      id: 'line_item_id',
      itemId: 'item_id',
      name: 'name',
      unit: 'unit',
      description: 'description',
      quantity: 'quantity',
      rate: 'rate',
      amount: 'item_total',
    };
  }

  /**
   * Converts a Zoho API record to a ZohoLineItem instance.
   * @param {Object} record - The Zoho API record.
   * @returns {ZohoLineItem}
   */
  static fromRecord(record) {
    const data = ZohoLineItem.convertRecordToData(record, ZohoLineItem.getToRecordMap());
    return new ZohoLineItem(data);
  }

  /**
   * Converts a ZohoLineItem instance to a Zoho API-compatible record.
   * @returns {Object}
   */
  toRecord() {
    return this.convertDataToRecord(ZohoLineItem.getToRecordMap());
  }

  /**
   * Factory method for creating a new ZohoLineItem instance with sensible defaults.
   * @param {Object} data - The data for the new line item.
   * @returns {ZohoLineItem}
   */
  static createNew(data = {}) {
    const lineItem = super.createNew(data);
    lineItem.quantity = data.quantity || 1; // Default quantity to 1
    lineItem.rate = data.rate || 0; // Default rate to 0
    lineItem.amount = data.amount || 0; // Default amount to 0
    return lineItem;
  }
}