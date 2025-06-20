const TEMPLATE_ID = '1MM_WM4uJkr1y331nnpSbRXwB2zC4P2rQJUxHpobZicc';
const DESTINATION_FOLDER_ID = '1dsvx-cjL26GXZYXN0GvE9iOjw38Kl3zV';
const REGISTRY_SHEET_ID = '1VOY4Xv8wqn0P0SjeGX1612c0uMmgJxH4NHItY4pLHUM';
const REGISTRY_SHEET_NAME = 'Member Registry';
const ADMIN_EMAIL = 'secretary@keoweekrafters.org';



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
   // Get the responder's email address
  let email = null;

  // If the form collects email automatically
  if (typeof response.getRespondentEmail === 'function') {
    email = response.getRespondentEmail();
  }

  const waiverManager = Membership.newWaiverManager();
  const result = waiverManager.generateWaiverDocument(email);
  return result;
}
