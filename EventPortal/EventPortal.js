/**
 * Open the index page
 */

function doGet(e) {
    return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Event Signup')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getEventList() {

  const eventManager = Membership.makeEventManager();
  return JSON.stringify(Membership.makeResponse(true, eventManager.getUpcomingEvents())); 
}

function signup(formData) {
    Membership.signup(formdata); 
    return { success: true, message: 'Signup successful!' };
}

