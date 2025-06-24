function test_when_form_is_submitted__then_waiver_is_generated() {

    const formStorageManager = new FormStorageManager(FormWaiver);
    const waiverManager = new WaiverManager(formStorageManager);
    
    // Simulate form submission
    const formResponse = {
        response: {
            getItemResponses: () => [
                { getItem: () => ({ getId: () => '1', getTitle: () => 'Signature' }), getResponse: () => 'Test Signature' },
                { getItem: () => ({ getId: () => '2', getTitle: () => 'Date' }), getResponse: () => '2023-10-01' },
                { getItem: () => ({ getId: () => '3', getTitle: () => 'Email'}), getResponse: () => 'testuser@keoweekrafters.org'}
            ], 
            getId: () => 'response123'
        }
    }
    const result = generateWaiverDocument(formResponse);
    if (!result || !result.pdfFile) {
        throw new Error('Waiver document generation failed.');
    }
    console.log('Waiver document generated successfully:', result.pdfFile.getName());
    // Verify the waiver is stored
    const waiverId = result.waiverId;
    const waiver = formStorageManager.getById(waiverId);
    if (!waiver) {
        throw new Error(`Waiver with ID ${waiverId} not found after generation.`);
    }
    console.log('Waiver retrieved successfully:', waiver);
    // Verify the PDF file is available
    const pdfFile = waiverManager.getWaiverPdf(waiverId);
    if (!pdfFile) { 
        throw new Error(`PDF file for waiver with ID ${waiverId} not found.`);
    }
    console.log('PDF file retrieved successfully:', pdfFile.getName());
}