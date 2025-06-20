/**
 * Tests for the Membership Form and Waiver forms using FormStoragerManger and WaiverManager.
* @file FormTests.js
*/
const WAIVER_ID = SharedConfig.forms.waiver.formId;
function test_when_waiverFormSubmitted_then_documentGenerated() {
    const formStorageManager= new FormStorageManager(FormWaiver);
    const waiverManager = newWaiverManager();
    
    // Locate the waiver form by its ID
    const waiverForm = formStorageManager.getById(WAIVER_ID);
    if (!waiverForm) {
        throw new Error(`Waiver form with ID ${WAIVER_ID} not found.`);
    }   
    
    const waiver = waiverManager.generateWaiverDocument(testMember.emailAddress);
    console.log('Waiver document generated successfully.');

    const pdfFile = waiverManager.getWaiverPdf(waiver.id);
    if (!pdfFile) {
        throw new Error(`PDF file for waiver with ID ${waiver.id} not found.`);
    }   

}

/**
 * Tests the creation of a waiver and verifies its availability in the storage.
 * @file FormTests.js
 */
function test_when_waiver_is_created_then_waiver_is_available() {
    const formStorageManager = new FormStorageManager(FormWaiver);
    const waiverManager = new WaiverManager(formStorageManager);
    
    // Create a new waiver
    const waiverData = {
        title: 'Test Waiver',
        description: 'This is a test waiver.',
        items: [
            { id: '1', title: 'Item 1', type: 'TEXT' },
            { id: '2', title: 'Item 2', type: 'CHECKBOX' }
        ]
    };
    
    const waiver = waiverManager.create(waiverData);
    
    
    // Verify the waiver is available
    const retrievedWaiver = formStorageManager.getById(waiver.id);
    if (!retrievedWaiver) {
        throw new Error('Waiver not found after creation.');
    }
    
    console.log('Waiver created and retrieved successfully:', retrievedWaiver);
}