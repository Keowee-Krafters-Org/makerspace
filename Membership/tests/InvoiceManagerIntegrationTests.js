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
  assert('Invoice list should be an array', true, Array.isArray(invoiceList));
  assert('Invoice list should not be empty', true, invoiceList.length > 0);
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
  assert('Invoice list should not be empty', true, invoiceList.length > 0);

  const firstInvoice = invoiceList[0];
  const invoiceId = firstInvoice.id;
  const createResponse = invoiceManager.getInvoiceById(invoiceId);
  assert('Invoice should be returned by ID', true, createResponse.id === invoiceId);
  console.log('Retrieved Invoice:', createResponse);
}

/**
 * Test that a new invoice can be created using TestyUser and Test Item. Testy User is a constant in MembershipIntegrationTests.js and Test Item is a constant in EventManagementIntegrationTests.js
 * This test checks if the invoice is created successfully and contains the expected data.
 */
function test_when_invoice_is_created_then_invoice_exists() {
  let invoiceId;
  try {
    const createResponse = create_test_invoice();

    assert('Invoice creation should be successful', true, createResponse.success);
    const createdInvoice = createResponse.data;
    invoiceId = createdInvoice.id;
    assert('Created invoice should have a valid ID', true, createdInvoice.id != undefined);
    console.log('Created Invoice:', createdInvoice);
  } catch (e) {
    console.error("Create Invoice Failed");
  } finally {
    if (createResponse && createResponse.success) {
      const invoiceId = createResponse.data.id; 
      invoiceManager.deleteInvoice(invoiceId);
    }
  }
}

function create_test_invoice(send = false) {

  console.log('Test: when_invoice_is_created_then_invoice_exists');
  const testMemberData = testMember; // Defined in MembershipIntegrationTests.js
  const testItemData = eventData.eventItem; // Defined in EventManagementIntegrationTests.js
  // Retrieve the test user and item data using the constants and the service methods. 
  const member = membershipManager.memberLookup(testMemberData.emailAddress);
  assert('Test User should be found', true, member != undefined);
  assert('Test User should have an ID', true, member.id != undefined);
  let testItem = eventManager.getEventItemByTitle(testItemData.title);
  if (!testItem) {
    testItem = eventManager.addEventItem(testItemData); 
  }
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
    contacts: [{id: member.primaryContactId}]
  };

  const createResponse = invoiceManager.createInvoice(invoiceData, send);
  return createResponse;

}

function test_when_invoice_is_created_and_sent__then_invoice_is_received() {
  let createResponse; 
  try {
    createResponse = create_test_invoice(true);
    assert('Invoice creation should be successful', true, createResponse.success);
    const createdInvoice = createResponse.data;
    invoiceId = createdInvoice.id;
    assert('Created invoice should have a valid ID', true, createdInvoice.id != undefined);
    console.log('Created Invoice:', createdInvoice);
  } catch (e) {
    console.error("Create Invoice Failed");
  } finally {
    if (createResponse && createResponse.success) {
      const invoiceId = createResponse.data.id; 
      invoiceManager.deleteInvoice(invoiceId);
    }
  }

}