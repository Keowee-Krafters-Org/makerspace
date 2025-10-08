/**
 * InvoiceManager class to manage invoices in the membership system.
 * It handles invoice creation, retrieval, updates, and deletions.
 * It integrates with Zoho for invoice storage and management.
 * 
 */
class InvoiceManager {
  constructor(storageManager, membershipManager, eventManager) {
    this.storageManager = storageManager; // Handles ZohoInvoice storage
    this.membershipManager = membershipManager; // Handles member-related operations
    this.eventManager = eventManager;
    this.config = getConfig();;
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

   /**
   * Creates an invoice for a specific event and member.
   * @param {Member} member - The member for whom the invoice is created.
   * @param {Event} event - The event for which the invoice is created.
   * @returns {Object} The created invoice.
   */
  createInvoiceForEvent(member, event) {
    const eventItem = event.eventItem;
    if (!eventItem || !eventItem.id) {
        throw new Error('Event item not found for invoicing.');
    }

    // Get the event start date
    const eventStartDate = new Date(event.date);
    if (isNaN(eventStartDate)) {
        throw new Error('Invalid event start date.');
    }

    // Calculate the due date based on config.eventInvoiceLeadTime
    const leadTime = this.config.eventInvoiceLeadTime || 7; // Default to 7 days if not configured
    const dueDate = new Date(eventStartDate);
    // limit due date to no earlier than today
    if (dueDate < new Date()) {
        dueDate.setTime(new Date().getTime());
    } else {
        dueDate.setDate(dueDate.getDate() - leadTime); // Subtract lead time from the event start date
    }

    const discountPercent = member.discount || 0;
    const invoiceData = {
        customerId: member.id,
        eventId: event.id,
        date: new Date(), // Invoice creation date
        dueDate: dueDate, // Calculated due date
        status: 'UNPAID',
        discount: `${discountPercent}%`,
        totalAmount: eventItem.price,
        lineItems: [
            {
                itemId: eventItem.id,
                description: eventItem.description,
                quantity: 1,
                rate: eventItem.price,
            },
        ],
        contacts: [
            { id: member.primaryContactId }
        ]
    };

    return this.createAndSendInvoice(invoiceData);
  }
    
  /** Creates a membership invoice for a member based on their registration level.
   * 
   * @param {*} member 
   * @returns 
   */
  createMembershipInvoice(member) {
    if (!member || !member.id) {
      throw new Error('Invalid member. Cannot generate invoice.');
    }

      // Ensure the member has a registration level
      if (!member.registration || !member.registration.level) {
      throw new Error('Member does not have a registration level. Cannot generate invoice.');
    } 

    // Get the membership fee from config based on the member's registration level
    const membershipLevel = member.registration.level;
    if (!this.config.levels || !this.config.levels[membershipLevel]) {
      throw new Error(`Membership level '${membershipLevel}' not found in configuration.`);
    } 

    const membershipItemId = this.config.levels[membershipLevel].itemId;
    if (!membershipItemId) {
      throw new Error(`No itemId configured for membership level '${membershipLevel}'. Cannot generate invoice.`);
    }   

    const eventItemResponse = this.eventManager.getEventItemById(membershipItemId); 
    if (!eventItemResponse || !eventItemResponse.data || !eventItemResponse.data.id) {
      throw new Error(`Membership item with ID '${membershipItemId}' not found. Cannot generate invoice.`);
    } 
    const eventItem = eventItemResponse.data;
        
    // Create the invoice data
    const invoiceData = {
      customerId: member.id,
      currency: 'USD',
      dueDate: new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0], // Default due upon receipt
      status: 'UNPAID',
      totalAmount: eventItem.price,
        lineItems: [
            {
                itemId: eventItem.id,
                description: eventItem.description,
                quantity: 1,
                rate: eventItem.price,
            },
        ],
        contacts: [
            { id: member.primaryContactId }
        ]
    };
    return this.createAndSendInvoice(invoiceData);
  }
}