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
    this.config = getConfig();
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
    return result;
  }

  /**
   * Creates a new invoice.
   * @param {Object} invoiceData - The data for the new invoice.
   * @returns {Object} The created invoice.
   */
  createInvoice(invoiceData, send = false) {
    try {
      if (this.config.paymentGateways) {
        invoiceData.paymentGateways = this.config.paymentGateways;
      }
      const invoice = this.storageManager.createNew(invoiceData);
      const result = this.storageManager.add(invoice, {send:send});
      if (!result || !result.id) {
        throw new Error('Failed to create invoice.');
      }
      return new Response ( true, result, 'Invoice created successfully' );
    } catch (err) {
      console.error('Failed to create invoice:', err);
      return new Response ( false, null, 'Failed to create invoice.', err.toString() );
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
    return  new Response ( true, createdInvoice, 'Invoice created and sent successfully' );
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
      return new Response ( true, result.data, 'Invoice updated successfully' );
    } catch (err) {
      console.error('Failed to update invoice:', err);
      return new Response ( false, null, 'Failed to update invoice.', err.toString() );
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
        return new Response ( false, null, 'Failed to get invoices for member.', invoicesResponse.err) ; 
      }
      const invoices = invoicesResponse.data; 
      const invoice = invoices.find(inv => inv.eventId === eventId);
      if (!invoice) {
        return new Response ( false, null, 'Invoice not found for the specified event.' );
      }
      return this.deleteInvoice(invoice.id);
    } catch (err) {
      console.error('Failed to delete invoice for event:', err);
      return new Response ( false, null, 'Failed to delete invoice for event.', err.toString() );
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
        return new Response ( false, null, 'Invoice not found.' );
      }
      this.storageManager.delete(invoiceId);
      return new Response ( true, null, 'Invoice deleted successfully!' );
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      return new Response ( false, null, 'Failed to delete invoice.', err.toString() );
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
      return new Response ( false, null, 'Failed to mark invoice as paid.', err.toString() );
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
      return new Response ( true, null, `Invoice sent to ${email}` );
    } catch (err) {
      console.error('Failed to send invoice:', err);
      return new Response ( false, null, 'Failed to send invoice.', err.toString() );
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
    if (!eventItem || !eventItem.id) throw new Error('Event item not found for invoicing.');

    const invoiceDate = new Date(); // today (invoice creation)
    const eventStartDate = new Date(event.date);
    if (isNaN(eventStartDate)) throw new Error('Invalid event start date.');

    const leadTimeDays = Number(this.config.eventInvoiceLeadTime || 7);
    const minDueLeadDays = Number(this.config.minInvoiceDueLeadDays || 1); // ensure due > invoice
    const dayMs = 86400000;

    let dueDate;
    // If we still have enough lead time before event, set due date = eventStart - leadTime
    if (eventStartDate.getTime() - leadTimeDays * dayMs > invoiceDate.getTime()) {
      dueDate = new Date(eventStartDate.getTime() - leadTimeDays * dayMs);
    } else {
      // Event is too close; push due date after invoice date
      dueDate = new Date(invoiceDate.getTime() + minDueLeadDays * dayMs);
      // If that accidentally exceeds event start, cap at event start (but still after invoice date)
      if (dueDate.getTime() >= eventStartDate.getTime()) {
        dueDate = new Date(Math.max(eventStartDate.getTime() - (0.5 * dayMs), invoiceDate.getTime() + minDueLeadDays * dayMs));
      }
    }

    // Format dates (Zoho typically expects yyyy-mm-dd)
    const fmt = d => d.toISOString().split('T')[0];

    const discountPercent = member.discount || 0;
    const invoiceData = {
      customerId: member.id,
      eventId: event.id,
      date: fmt(invoiceDate),
      dueDate: fmt(dueDate),
      status: 'UNPAID',
      discount: `${discountPercent}%`,
      totalAmount: eventItem.price,
      lineItems: [
        { itemId: eventItem.id, description: eventItem.description, quantity: 1, rate: eventItem.price }
      ],
      contacts: [{ id: member.primaryContactId }]
    };

    return this.createAndSendInvoice(invoiceData);
  }
    
  /** Creates a membership invoice for a member based on their registration level.
   * 
   * @param {*} member 
   * @returns 
   */
  createMembershipInvoice(member) {
    if (!member || !member.id) throw new Error('Invalid member.');
    if (!member.registration?.level) throw new Error('Missing registration level.');
    if (!this.config.levels?.[member.registration.level]) throw new Error(`Level '${member.registration.level}' not found.`);

    const membershipItemId = this.config.levels[member.registration.level].itemId;
    if (!membershipItemId) throw new Error(`No itemId for level '${member.registration.level}'.`);

    const eventItemResponse = this.eventManager.getEventItemById(membershipItemId);
    if (!eventItemResponse?.data?.id) throw new Error(`Membership item '${membershipItemId}' not found.`);
    const eventItem = eventItemResponse.data;

    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate.getTime() + 86400000); // +1 day to satisfy "after invoice date"
    const fmt = d => d.toISOString().split('T')[0];

    const invoiceData = {
      customerId: member.id,
      currency: 'USD',
      date: fmt(invoiceDate),
      dueDate: fmt(dueDate),
      status: 'UNPAID',
      totalAmount: eventItem.price,
      lineItems: [
        { itemId: eventItem.id, description: eventItem.description, quantity: 1, rate: eventItem.price }
      ],
      contacts: [{ id: member.primaryContactId }]
    };
    return this.createAndSendInvoice(invoiceData);
  }
}