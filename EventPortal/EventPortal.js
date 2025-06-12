/**
 * Open the index page
 */

function doGet(e) {
    return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Event Signup')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getEventList() {

  const eventManager = Membership.newEventManager();
  return JSON.stringify(eventManager.getUpcomingEvents()); 
}

function signup(formData) {
    Membership.signup(formdata); 
    return { success: true, message: 'Signup successful!' };
}

