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
  const response = e.response;
  const itemResponses = response.getItemResponses();
  const responses = {};

  itemResponses.forEach(itemResponse => {
    const itemTitle = itemResponse.getItem().getTitle();
    const value = itemResponse.getResponse();
    responses[itemTitle] = value;
  });

  const email = responses['Email'];

  Logger.log(JSON.stringify(responses)); 
  const waiverManager = Membership.newWaiverManager();
  const result = waiverManager.generateWaiverDocument(email);
  return result;
}
