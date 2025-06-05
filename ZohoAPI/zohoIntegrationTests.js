/**
 * Integration tests for the Zoho API.
 * These tests cover the functionality of exchanging a grant token for an access token,
 * refreshing an access token, and generating the authorization URL.    
 * The calls are not mocked and will make actual requests to the Zoho API.
 * Ensure you have valid credentials and the Zoho API is accessible before running these tests.
 */

function zohoIntegrationTests() {
    const authConfig = getAuthConfig();
    const zoho = new ZohoAPI(authConfig);

    // Test: exchangeGrantTokenForToken
    try {
        const tokenResponse = zoho.exchangeGrantTokenForToken(authConfig.grantToken);
        Logger.log('exchangeGrantTokenForToken response:', tokenResponse);
    } catch (error) {
        Logger.log('exchangeGrantTokenForToken failed:', error.message);
    }

    // Test: refreshAccessToken
    try {
        const refreshResponse = zoho.refreshAccessToken(tokenResponse.refresh_token);
        Logger.log('refreshAccessToken response:', refreshResponse);
    } catch (error) {
        Logger.log('refreshAccessToken failed:', error.message);
    }

    // Test: getAuthorizationUrl
    const authUrl = zoho.getAuthorizationUrl(authConfig.scope, authConfig.state);
    Logger.log('Authorization URL:', authUrl);
    // Note: You need to manually visit the authUrl, authorize the app, and get the code from the redirect URL. 



    // After getting the code, you can test exchangeCodeForToken
    try {
        const code = 'your_authorization_code_here'; // Replace with the actual code obtained from the redirect
        const tokenResponse = zoho.exchangeCodeForToken(code);
        Logger.log('exchangeCodeForToken response:', tokenResponse);
    } catch (error) {
        Logger.log('exchangeCodeForToken failed:', error.message);
    }   
}

function test_getAllCustomers() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        const response = zoho.getAllCustomers(zoho.authConfig.organizationId);
        Logger.log('getAllCustomers response:', response.message);
        const customers = response.customers;
        Logger.log(`Retrieved ${customers.length} customers.`);
        // Assert that customers are retrieved
        assert(customers, 'Customers should not be null or undefined');
        assert(customers.length > 0 , `${customers.length} Customers are retrieved`); 
    } catch (error) {
        Logger.log('getAllCustomers failed:', error.message);
    }
}

function test_getCustomerById() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        // First, get all customers to obtain a valid customer/contact ID
        const allResponse = zoho.getAllCustomers(zoho.authConfig.organizationId);
        const customers = allResponse.contacts || allResponse.customers || [];
        assert(customers.length > 0, 'At least one customer should exist to test getCustomerById');

        const customerId = customers[0].contact_id;
        Logger.log(`Testing getCustomerById with contact_id: ${customerId}`);

        const customerResponse = zoho.getCustomerById(zoho.authConfig.organizationId, customerId);
        Logger.log('getCustomerById response:', customerResponse);

        // Assert that the returned customer matches the requested ID
        assert(customerResponse.contact && customerResponse.contact.contact_id === customerId, 'getCustomerById returns the correct customer');
    } catch (error) {
        Logger.log('getCustomerById failed:', error.message);
    }
}

function test_findCustomerByEmail() {
    const zoho = new ZohoAPI(getAuthConfig());
    try {
        // Get all customers to obtain a valid email address for testing
        const allResponse = zoho.getAllCustomers(zoho.authConfig.organizationId);
        const customers = allResponse.customers || allResponse.contacts || [];
        assert(customers.length > 0, 'At least one customer should exist to test findCustomerByEmail');

        const testEmail = customers[0].email || customers[0].email_address;
        Logger.log(`Testing findCustomerByEmail with email: ${testEmail}`);

        const customer = zoho.findCustomerByEmail(zoho.authConfig.organizationId, testEmail);
        Logger.log('findCustomerByEmail response:', customer);

        // Assert that the returned customer matches the requested email
        assert(customer && (customer.email === testEmail || customer.email_address === testEmail), 'findCustomerByEmail returns the correct customer');
    } catch (error) {
        Logger.log('findCustomerByEmail failed:', error.message);
    }
}