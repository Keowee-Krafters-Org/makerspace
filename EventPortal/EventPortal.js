/**
 * Open the index page
 */
const modelFactory = Membership.newModelFactory();
function doGet(e) {
  const memberId = e.parameter.memberId;
  if (!memberId) {
    return HtmlService.createHtmlOutput('Missing memberId.');
  }

  const response = getMember(memberId);
  if (!response.success) {
    return HtmlService.createHtmlOutput('User not found.');
  }

  const authentication = response.data.login.authentication;
  const isValid = new Date() < new Date(authentication.expirationTime);
  if (!isValid) {
    return HtmlService.createHtmlOutput('Invalid or expired token.');
  }
  const member = response.data;
  // Remove the token for security 
  delete member.login.authentication.token;
  const template = HtmlService.createTemplateFromFile('index');
  template.member = member // inject member directly
  
  return template.evaluate()
    .setTitle('Event Signup')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getEventList() {
  const eventManager = Membership.modelFactory.newEventManager();
  return JSON.stringify(eventManager.getUpcomingEvents()); 
}

function signup(classId, memberId) {
  const eventManager = Membership.modelFactory.newEventManager(); 
  const response = eventManager.signup( classId, memberId ); 
  return JSON.stringify(response);
}

function getSharedConfig() {
  return Membership.SharedConfig;
}

function getMember(memberId) {
  const membershipManager = Membership.modelFactory.modelFactory.newMembershipManager(); 
  return membershipManager.getMember(memberId);
}

function createEvent(eventData) {
  const event = JSON.parse(eventData);
  const eventManager = Membership.modelFactory.newEventManager();
  const eventInstance = eventManager.createEvent(event);
  const response = eventManager.addEvent(eventInstance); // assumes addEvent creates a new record and calendar event
  return JSON.stringify(response);
}

function updateEvent(eventData) {
  const event = JSON.parse(eventData); 
  const eventManager = Membership.modelFactory.newEventManager();
  const eventInstance = eventManager.createEvent(event); 
  const response = eventManager.updateEvent(eventInstance);
  return JSON.stringify(response);
}
