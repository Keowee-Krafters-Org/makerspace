/**
 * Generate the document from the waiver form
 * Note: Any change to the form or the document must be synchronized with this function
 * @param {Object} e - The event object containing the form response.
 * 
  * @returns {Object} The result of the waiver document generation, including the PDF file.
  * @throws {Error} If the waiver document generation fails.
  * @description This function retrieves the responder's email address from the form response,
  * generates a waiver document using the Membership's WaiverManager, and returns the result.
  * It is designed to be triggered by a form submission event, and it handles both cases
  * where the form collects the email automatically or has a custom email question.
 */
function generateWaiverDocument(e) {
  const responses = {};

  // Primary path: installable trigger from the Sheet (on form submit).
  if (e && e.range) {
    const sheet = e.range.getSheet();
    const row = e.range.getRow();
    const lastColumn = sheet.getLastColumn();

    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    const rowValues = sheet.getRange(row, 1, 1, lastColumn).getValues()[0];

    headers.forEach((header, index) => {
      if (header) {
        responses[String(header)] = rowValues[index];
      }
    });
  } else if (e && e.namedValues) {
    // Secondary path: some submit events provide namedValues only.
    Object.keys(e.namedValues).forEach(key => {
      const value = e.namedValues[key];
      responses[key] = Array.isArray(value) ? value[0] : value;
    });
  } else if (e && e.response) {
    // Backward compatibility: direct Form submit event object.
    const itemResponses = e.response.getItemResponses();
    itemResponses.forEach(itemResponse => {
      const itemTitle = itemResponse.getItem().getTitle();
      const value = itemResponse.getResponse();
      responses[itemTitle] = value;
    });
  } else {
    throw new Error('No supported trigger event payload found. Expected sheet submit event.');
  }

  Logger.log(JSON.stringify(responses)); 
  const waiverManager = new SheetWaiverManager();
  const result = waiverManager.generateWaiverDocument(responses);
  return result;
}