/**
 * Integration tests for the Zoho API.
 * These tests cover the functionality of exchanging a grant token for an access token,
 * refreshing an access token, and generating the authorization URL.    
 * The calls are not mocked and will make actual requests to the Zoho API.
 * Ensure you have valid credentials and the Zoho API is accessible before running these tests.
 */
const testyFilter = {itemName: 'Test Event'};
function zohoIntegrationTests() {
    Logger.log('Starting Zoho API integration tests...');

  
    // Test: getAllCustomers
    test_getAllCustomers();

    // Test: getCustomerById
    test_getCustomerById();

    // Test: findCustomerByEmail
    test_findCustomerByEmail();

    Logger.log('Zoho API integration tests completed.');
}

function test_getAllCustomers() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        const response = zoho.getAllCustomers();
        Logger.log(`getAllCustomers response: ${response.message}`);
        const customers = response.customers;
        Logger.log(`Retrieved ${customers.length} customers.`);
        // Assert that customers are retrieved
        assert(customers, 'Customers should not be null or undefined');
        assert(customers.length > 0 , `${customers.length} Customers are retrieved`); 
    } catch (error) {
        Logger.log(`getAllCustomers failed: ${error.message}`);
    }
}

function test_getCustomerById() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        // First, get all customers to obtain a valid customer/contact ID
        const allResponse = zoho.getAllCustomers();
        const customers = allResponse.customers || [];
        assert(customers.length > 0, 'At least one customer should exist to test getCustomerById');

        const customerId = customers[0].contact_id;
        Logger.log(`Testing getCustomerById with contact_id: ${customerId}`);

        const customerResponse = zoho.getCustomerById(customerId);
        Logger.log(`getCustomerById response: ${customerResponse}`);

        // Assert that the returned customer matches the requested ID
        assert(customerResponse.customer && customerResponse.customer.contact_id === customerId, 'getCustomerById returns the correct customer');
    } catch (error) {
        Logger.log(`getCustomerById failed: ${error.message}`);
    }
}

function test_findCustomerByEmail() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        // Get all customers to obtain a valid email address for testing
        const allResponse = zoho.getAllCustomers();
        const customers = allResponse.customers || [];
        assert(customers.length > 0, 'At least one customer should exist to test findCustomerByEmail');

        const testEmail = customers[0].email || customers[0].email_address;
        Logger.log(`Testing findCustomerByEmail with email: ${testEmail}`);

        const customerResponse = zoho.findCustomerByEmail(testEmail);
        assert(customerResponse.code==='200', 'Customer found');
        const customer = customerResponse.customer;
        Logger.log(`findCustomerByEmail response: ${customer}`);

        // Assert that the returned customer matches the requested email
        assert(customer && (customer.email === testEmail || customer.email_address === testEmail), 'findCustomerByEmail returns the correct customer');
    } catch (error) {
        Logger.log(`findCustomerByEmail failed: ${error.message}`);
    }
}

function test_getAllItems() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        const response = zoho.getAllItems(testyFilter);
        Logger.log(`getAllItems response: ${response.message}`);
        const items = response.items;
        Logger.log(`Retrieved ${items.length} items.`);
        // Assert that items are retrieved
        assert(items, 'Items should not be null or undefined');
        assert(items.length > 0 , `${items.length} Items are retrieved`); 
    } catch (error) {
        Logger.log(`getAllItems failed: ${error.message}`);
    }
}   

function test_getItemById() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        // First, get all items to obtain a valid item ID
        const allResponse = zoho.getAllItems();
        const items = allResponse.items || [];
        assert(items.length > 0, 'At least one item should exist to test getItemById');
        const itemId = items[0].item_id;
        Logger.log(`Testing getItemById with item_id: ${itemId}`);  
        const itemResponse = zoho.getItemById(itemId);      
        Logger.log(`getItemById response: ${itemResponse}`);
        // Assert that the returned item matches the requested ID
        assert(itemResponse.item && itemResponse.item.item_id === itemId, 'getItemById returns the correct item');
    } catch (error) {
        Logger.log(`getItemById failed: ${error.message}`);
    }
}

function test_GetFilteredItems() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        // First, get all items to obtain a valid item ID
        const allResponse = zoho.getAllItems({page: 1, per_page: 10});
        const items = allResponse.items || [];
        assert(items.length > 0, 'At least one item should exist to test getFilteredItems');
        
        // Use the first item's productType for filtering
        const productType = items[0].productType;
        Logger.log(`Testing getFilteredItems with productType: ${productType}`);
        
        const filteredItemResponse = zoho.getAllItems({productType: productType}); 
        const filteredItems = filteredItemResponse.items || [];
        Logger.log('getFilteredItems response:{}', filteredItems);
        
        // Assert that the filtered items match the filter criteria
        assert(filteredItems.length > 0, 'getFilteredItems should return at least one item');
        assert(filteredItems.every(item => item.productType === productType), 'All filtered items should match the filter criteria');
    } catch (error) {
        Logger.log(`getFilteredItems failed: ${error.message}`);
    }
}
    /**
     * Test to get items by custom field value.
     * This test retrieves all items and filters them by a custom field value.
     * It asserts that the filtered items match the custom field value.
     * @returns {void}
     * @throws {Error} If the test fails.
     * @example
     * test_getItemsByCustomFieldValue();       
     */
    function test_getItemsByCustomFieldValue() {
        const zoho = new ZohoAPI(getAuthConfig());
        try {
            // First, get all items to obtain a valid custom field value
            const allResponse = zoho.getAllItems();
            const items = (allResponse.items || []).filter(item => item.cf_type==='Class'); // Replace with actual custom field name
            assert(items.length > 0, 'At least one item should exist to test getItemsByCustomFieldValue');
            
            // Use the first item's custom field value for filtering
            const customFieldValue = items[0].cf_type; // Replace with actual custom field name
            Logger.log(`Testing getItemsByCustomFieldValue with custom field value: ${customFieldValue}`);
            
            const filteredItems = zoho.getItemsByCustomFieldValue('cf_type', customFieldValue); // Replace with actual custom field name
            Logger.log(`getItemsByCustomFieldValue response: ${filteredItems}`);
            
            // Assert that the filtered items match the custom field value
            assert(filteredItems.length > 0, 'getItemsByCustomFieldValue should return at least one item');
            assert(filteredItems.every(item => item.custom_field_value === customFieldValue), 'All filtered items should match the custom field value');
        } catch (error) {
            Logger.log(`getItemsByCustomFieldValue failed: ${error.message}`);
        }
}

/**
 * Test for updating the 'Test Event' item's cf_event_description field.
 * This test finds the 'Test Event' item, updates its cf_event_description,
 * and verifies the update via a follow-up fetch.
 * @returns {void}
 */
function test_updateEventDescription() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        // Find the 'Test Event' item
        const allResponse = zoho.getEntities('items',{name: 'Test Event'});
        Logger.log(`getAllItems response: ${allResponse}`);
        const items = allResponse.items || [];
        const testEvent = items.find(item => item.name === 'Test Event' || item.item_name === 'Test Event');
        assert(testEvent, "'Test Event' item must exist for this test");

        const itemId = testEvent.item_id;
        const newDescription = 'Updated event description for integration test';

        // Prepare update payload (Zoho expects { item: { ... } })
        const updatePayload = {item: {...testEvent, rate: 75, 
            cf_event_description: newDescription
        }};
        const updateResponse = zoho.updateEntity('items', itemId, updatePayload );
        Logger.log(`updateEntity response: ${updateResponse}`);

        // Fetch the item again to verify the update
        const verifyResponse = zoho.getEntity('items', itemId);
        Logger.log(`verify updated item: ${verifyResponse}`);

        const updatedItem = verifyResponse.item;
        assert(updatedItem, 'Updated item should be returned');
        assert(updatedItem.cf_event_description === newDescription, 'cf_event_description should be updated');
    } catch (error) {
        Logger.log(`test_updateEventDescription failed: ${error.message}`);
    }
}

/**
 * Test for getEntitiesWithCustomFields to ensure multi-line custom fields are retrieved as top-level cf_xx fields.
 * This test fetches all items and checks that cf_event_description (multi-line) is present and matches the value in custom_fields.
 */
function test_getEntitiesWithCustomFields() {
    const zoho = newZohoAPI();
    const response = zoho.getEntitiesWithCustomFields('items');
    Logger.log(`getEntitiesWithCustomFields response: ${response}`);

    const items = response.items || [];
    assert(items.length > 0, 'Should retrieve at least one item');

    // Check that cf_event_description is present as a top-level field if it exists in custom_fields
    items.forEach(item => {
        if (item.custom_fields) {
            const cf = item.custom_fields.find(f => f.api_name === 'cf_event_description');
            if (cf) {
                assert(
                    item.cf_event_description === cf.value,
                    `cf_event_description should match custom_fields value for item ${item.item_id || item.id}`
                );
            }
        }
    });

    Logger.log('test_getEntitiesWithCustomFields passed.');
}



