/**
 * ZohoInvoice class for managing invoices in Zoho Books.
 * Extends the Invoice class and integrates with Zoho's API for invoice storage and management.
 */
class ZohoInvoice extends Invoice {
  /**
   * Constructor for ZohoInvoice.
   * @param {Object} data - The data to initialize the invoice.
   */
  constructor(data = {}) {
    super(data);
  }

  /**
   * Returns the singular resource name for Zoho Invoices.
   * @returns {string} The singular resource name.
   */
  static getResourceNameSingular() {
    return 'invoice';
  }

  /**
   * Returns the plural resource name for Zoho Invoices.
   * @returns {string} The plural resource name.
   */
  static getResourceNamePlural() {
    return 'invoices';
  }

  /**
   * Returns the default filter for retrieving invoices.
   * @returns {Object} The filter object.
   */
  static getFilter() {
    return { status: 'unpaid' }; // Example filter for unpaid invoices
  }

  /**
   * Returns the mapping for converting ZohoInvoice objects to Zoho API records.
   * @returns {Object} The mapping object.
   */
  static getToRecordMap() {
    return {
      id: 'invoice_id',
      customerId: 'customer_id',
      date: 'date',
      dueDate: 'due_date',
      status: 'status',
      totalAmount: 'total',
      lineItems: 'line_items',
    };
  }

  /**
   * Returns the mapping for converting Zoho API records to ZohoInvoice objects.
   * @returns {Object} The mapping object.
   */
  static getFromRecordMap() {
    return {
      invoice_id: 'id',
      customer_id: 'customerId',
      date: 'date',
      due_date: 'dueDate',
      status: 'status',
      total: 'totalAmount',
      line_items: 'lineItems',
    };
  }

  /**
   * Converts a Zoho API record to a ZohoInvoice instance.
   * @param {Object} record - The Zoho API record.
   * @returns {ZohoInvoice} The ZohoInvoice instance.
   */
  static fromRecord(record) {
    const data = ZohoInvoice.convertRecordToData(record, ZohoInvoice.getFromRecordMap());

    // Convert date fields to Date objects
    if (record.date) {
      data.date = new Date(record.date);
    }
    if (record.due_date) {
      data.dueDate = new Date(record.due_date);
    }

    // Parse line items using ZohoLineItem
    if (record.line_items) {
      data.lineItems = record.line_items.map(item => ZohoLineItem.fromRecord(item));
    }

    return new ZohoInvoice(data);
  }

  /**
   * Converts a ZohoInvoice instance to a Zoho API-compatible record.
   * @returns {Object} The Zoho API-compatible record.
   */
  toRecord() {
    const record = this.convertDataToRecord(ZohoInvoice.getToRecordMap());

    // Flatten line items using ZohoLineItem
    if (this.lineItems) {
      record.line_items = this.lineItems.map(item => item.toRecord());
    }

    record.date = this.date ? this.date.toISOString().split('T')[0] : '';
    record.due_date = this.dueDate ? this.dueDate.toISOString().split('T')[0] : '';
    return record;
  }

  /**
   * Factory method for creating a new ZohoInvoice instance with sensible defaults.
   * @param {Object} data - The data for the new invoice.
   * @returns {ZohoInvoice} The new ZohoInvoice instance.
   */
  static createNew(data = {}) {
    const invoice = super.createNew(data);
    invoice.status = 'UNPAID'; // Default status
    invoice.lineItems = Array.isArray(data.lineItems)
      ? data.lineItems.map(item => ZohoLineItem.createNew(item))
      : [];
    return invoice;
  }
}