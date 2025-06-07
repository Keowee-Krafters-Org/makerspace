/**
 * Integration test for the ZohoStorageManager and the Zoho API.
 * This test suite covers the functionality of retrieving all customers,
 * retrieving a member (contact) by ID, and finding a member by email.
 * It uses the Zoho API to interact with Zoho Books and Zoho CRM.
 * @returns {void}
 * @example
 * zohoIntegrationTests();
 */
function membershipIntegrationTests() {
    Logger.log('Starting Zoho API integration tests...');

    // Test: getAllMembers
    test_getAllMembers();

    // Test: getMemberById
    test_getMemberById();

    // Test: findMemberByEmail
    test_findMemberByEmail();

    Logger.log('Zoho API integration tests completed.');
}   

/**
 * Test for retrieving all members from ZohoStorageManager.
 * This test checks if the API can successfully retrieve a list of customers.   
 * * @returns {void}
 * Uses the IStorageManager and ZohoStorageManager classes to perform the test.
 */
 function test_getAllMembers() {
    const storageManager = new ZohoStorageManager();
    try {
        const response = storageManager.getAll(Member, {first_name: 'Testy'});
        Logger.log('getAllMembers response:', response.message);
        const members = response.data;
        Logger.log(`Retrieved ${members.length} members.`);
        // Assert that members are retrieved
        assert( 'Members should not be null or undefined', members != undefined, true);
        assert(`${members.length} Members are retrieved`, members.length > 0, true);
    } catch (error) {
        Logger.log('getAllMembers failed:', error.message);
    }
}   

    // Test: getMemberById
    function test_getMemberById() {
    const storageManager = new ZohoStorageManager();    

    try {
        // First, get all members to obtain a valid member ID
        const allResponse = storageManager.getAll(Member, {first_name: 'Testy'});
        const members = allResponse.data || [];
        assert( 'At least one member should exist to test getMemberById', members.length > 0,true);   
        const memberId = members[0].id;
        Logger.log(`Testing getMemberById with ID: ${memberId}`);
        const memberResponse = storageManager.getById(Member, memberId);
        Logger.log('getMemberById response:', memberResponse);
        // Assert that the returned member matches the requested ID
        const returnedMember = memberResponse.data; 
        assert('getMemberById returns the correct member', returnedMember.id === memberId, true); 
    }   
    catch (error) {
        Logger.log('getMemberById failed:', error.message);
    }
} 