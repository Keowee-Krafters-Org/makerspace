/**
 * Integration tests for the InvoiceManager class.
 * These tests use the actual InvoiceManager and its dependencies.
 */

  // Initialize dependencies
  const storageManager = new ZohoStorageManager(ZohoInvoice);
 // const membershipManager = new MembershipManager(new ZohoStorageManager(ZohoMember));
  const invoiceManager = new InvoiceManager(storageManager, membershipManager);

  /**
   * Test that invoices exist in the system.
   * This test checks if the invoice list is not empty.
   */
  function test_when_invoice_list_is_requested_then_invoices_exist() {
    console.log('Test: when_invoice_list_is_requested_then_invoices_exist');
    const invoiceListResponse = invoiceManager.getInvoiceList();
    const invoiceList = invoiceListResponse.data; 
    assert( 'Invoice list should be an array', true, Array.isArray(invoiceList));
    assert('Invoice list should not be empty', true, invoiceList.length > 0 );
    console.log('Invoice List:', invoiceList);
  }
 
    /** 
     * Test that a specific invoice can be retrieved by ID.
     * This test checks if the invoice with the given ID exists and is returned correctly.
     */
  function test_when_invoice_is_requested_by_id_then_invoice_exists() {
    console.log('Test: when_invoice_is_requested_by_id_then_invoice_exists');
    const invoiceListResponse = invoiceManager.getInvoiceList();
    const invoiceList = invoiceListResponse.data; 
    assert('Invoice list should be an array', true, Array.isArray(invoiceList));
    assert('Invoice list should not be empty', true, invoiceList.length > 0 );

    const firstInvoice = invoiceList[0];
    const invoiceId = firstInvoice.id;
    const invoiceResponse = invoiceManager.getInvoiceById(invoiceId);
    assert('Invoice should be returned by ID', true, invoiceResponse.id === invoiceId);
    console.log('Retrieved Invoice:', invoiceResponse);
  }

    /**
     * Test that a new invoice can be created using TestyUser and Test Item. Testy User is a constant in MembershipIntegrationTests.js and Test Item is a constant in EventManagementIntegrationTests.js
     * This test checks if the invoice is created successfully and contains the expected data.
     */
  function test_when_invoice_is_created_then_invoice_exists() {
    let invoiceId; 
    try {
    console.log('Test: when_invoice_is_created_then_invoice_exists');
    const testMemberData = testMember; // Defined in MembershipIntegrationTests.js
    const testItemData = eventData.eventItem; // Defined in EventManagementIntegrationTests.js
    // Retrieve the test user and item data using the constants and the service methods. 
    const member = membershipManager.memberLookup(testMemberData.emailAddress);
    assert('Test User should be found', true, member != undefined);
    assert('Test User should have an ID', true, member.id != undefined);
    const testItem = eventManager.getEventItemByTitle(testItemData.title);
    assert('Test Item should be found', true, testItem != undefined);
    assert('Test Item should have a price', true, testItem.price > 0);
    const invoiceData = {
      customerId: member.id,
      date: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      status: 'UNPAID',
      totalAmount: testItem.price,
      lineItems: [
        {
          itemId: testItem.id,
          description: testItem.description,
          quantity: 1,
          rate: testItem.price,
        },
      ],
    };

    const createResponse = invoiceManager.createInvoice(invoiceData);
    assert('Invoice creation should be successful', true, createResponse.success);
    const createdInvoice = createResponse.data;
    invoiceId = createdInvoice.id; 
    assert('Created invoice should have a valid ID', true, createdInvoice.id != undefined);
    console.log('Created Invoice:', createdInvoice);
    } catch(e) {
      console.error ("Create Invoice Failed"); 
    } finally {
      if (invoiceId) {
        invoiceManager.deleteInvoice(invoiceId);
      }
    }
  }