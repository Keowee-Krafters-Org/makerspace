/**
 * InvoiceManager class to manage invoices in the membership system.
 * It handles invoice creation, retrieval, updates, and deletions.
 * It integrates with Zoho for invoice storage and management.
 * 
 */
class InvoiceManager {
  constructor(storageManager, membershipManager) {
    this.storageManager = storageManager; // Handles ZohoInvoice storage
    this.membershipManager = membershipManager; // Handles member-related operations
  }

  /**
   * Retrieves a list of all invoices with optional filters.
   * @param {Object} params - Optional parameters to filter the invoices.
   * @returns {Array} An array of invoices.
   */
  getInvoiceList(params = {}) {
    return this.storageManager.getAll(params);
  }

  /**
   * Retrieves a specific invoice by its ID.
   * @param {string} id - The ID of the invoice.
   * @returns {Object} The invoice object.
   */
  getInvoiceById(id) {
    const result = this.storageManager.getById(id);
    if (!result || !result.data) {
      throw new Error(`Invoice not found for ID: ${id}`);
    }
    return result.data;
  }

  /**
   * Creates a new invoice.
   * @param {Object} invoiceData - The data for the new invoice.
   * @returns {Object} The created invoice.
   */
  createInvoice(invoiceData, send = false) {
    try {
      const invoice = this.storageManager.createNew(invoiceData);
      const result = this.storageManager.add(invoice, {send:send});
      if (!result || !result.id) {
        throw new Error('Failed to create invoice.');
      }
      return { success: true, data: result };
    } catch (err) {
      console.error('Failed to create invoice:', err);
      return { success: false, message: 'Failed to create invoice.', error: err.toString() };
    }
  }


  /** Create and send an invlice  
   * @param {Object} invoiceData - The data for the new invoice.
   * @returns {Object} The created invoice.
   */
  createAndSendInvoice(invoiceData) {
    const createResponse = this.createInvoice(invoiceData, true);
    if (!createResponse.success) {
      return createResponse;
    }
    const createdInvoice = createResponse.data;
    return { success: true, data: createdInvoice };
  } 
  /**
   * 
   * Updates an existing invoice.
   * @param {Object} invoiceData - The updated data for the invoice.
   * @returns {Object} The updated invoice.
   */
  updateInvoice(invoiceData) {
    try {
      const invoice = this.storageManager.createNew(invoiceData);
      const result = this.storageManager.update(invoice.id, invoice);
      if (!result || !result.data) {
        throw new Error('Failed to update invoice.');
      }
      return { success: true, data: result.data };
    } catch (err) {
      console.error('Failed to update invoice:', err);
      return { success: false, message: 'Failed to update invoice.', error: err.toString() };
    }
  }

  /**
   * Delete an invoice for a member and event
   * @param {Object} member - The member object.
   * @param {string} eventId - The ID of the event.
   * @returns {Object} Response indicating success or failure.  
   */
  deleteInvoiceFor(memberId, eventId) {
    try {
      const invoicesResponse = this.getInvoicesByMember(memberId);
      if (!invoicesResponse || !invoicesResponse.success) {
        return {sucess:false, error: invoicesResponse.err} ; 
      }
      const invoices = invoicesResponse.data; 
      const invoice = invoices.find(inv => inv.eventId === eventId);
      if (!invoice) {
        return { success: false, message: 'Invoice not found for the specified event.' };
      }
      return this.deleteInvoice(invoice.id);
    } catch (err) {
      console.error('Failed to delete invoice for event:', err);
      return { success: false, message: 'Failed to delete invoice for event.', error: err.toString() };
    }
  }

  /**
   * Deletes an invoice by its ID.
   * @param {string} invoiceId - The ID of the invoice to delete.
   * @returns {Object} Response indicating success or failure.
   */
  deleteInvoice(invoiceId) {
    try {
      const invoice = this.storageManager.getById(invoiceId);
      if (!invoice) {
        return { success: false, message: 'Invoice not found.' };
      }
      this.storageManager.delete(invoiceId);
      return { success: true, message: 'Invoice deleted successfully!' };
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      return { success: false, message: 'Failed to delete invoice.', error: err.toString() };
    }
  }

  /**
   * Retrieves invoices for a specific member.
   * @param {string} memberId - The ID of the member.
   * @returns {Array} An array of invoices for the member.
   */
  getInvoicesByMember(memberId) {
    return this.storageManager.getAll({customerId:memberId, pageSize:20});
  }

  /**
   * Marks an invoice as paid.
   * @param {string} invoiceId - The ID of the invoice to mark as paid.
   * @returns {Object} Response indicating success or failure.
   */
  markInvoiceAsPaid(invoiceId) {
    try {
      const invoice = this.getInvoiceById(invoiceId);
      invoice.status = 'PAID';
      return this.updateInvoice(invoice);
    } catch (err) {
      console.error('Failed to mark invoice as paid:', err);
      return { success: false, message: 'Failed to mark invoice as paid.', error: err.toString() };
    }
  }

  /**
   * Sends an invoice to a member via email.
   * @param {string} invoiceId - The ID of the invoice to send.
   * @param {string} email - The email address of the recipient.
   * @returns {Object} Response indicating success or failure.
   */
  sendInvoice(invoice) {
    try {
      // Logic to send the invoice via email (e.g., using Zoho API)
      console.log(`Sending invoice ${invoiceId} to ${email}`);
      return { success: true, message: `Invoice sent to ${email}` };
    } catch (err) {
      console.error('Failed to send invoice:', err);
      return { success: false, message: 'Failed to send invoice.', error: err.toString() };
    }
  }
}