const TEMPLATE_ID = '1MM_WM4uJkr1y331nnpSbRXwB2zC4P2rQJUxHpobZicc';
const DESTINATION_FOLDER_ID = '1dsvx-cjL26GXZYXN0GvE9iOjw38Kl3zV';
const REGISTRY_SHEET_ID = '1VOY4Xv8wqn0P0SjeGX1612c0uMmgJxH4NHItY4pLHUM';
const REGISTRY_SHEET_NAME = 'Member Registry';
const ADMIN_EMAIL = 'secretary@keoweekrafters.org';



/**
 * Generate the document from the waiver form
 * Note: Any change to the form or the document must be synchronized with this function
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

  const waiverManager = Membership.newWaiverManager();
  const result = waiverManager.generateWaiverDocument(itemResponses);
}
