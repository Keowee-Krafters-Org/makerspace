/**
 * Open the index page
 */
function doGet(e) {

  const modelFactory = Membership.newModelFactory();
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
  template.sharedConfig = modelFactory.config;

  return template.evaluate()
    .setTitle('Event Signup')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getEventList() {

  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const events = eventManager.getUpcomingEvents();
  return JSON.stringify({success: true, data: events});
}

function signup(classId, memberId) {

  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const response = eventManager.signup(classId, memberId);
  return JSON.stringify(response);
}

function getSharedConfig() {
  return Membership.SharedConfig;
}

function getMember(memberId) {

  const modelFactory = Membership.newModelFactory();
  const membershipManager = modelFactory.membershipManager();
  return membershipManager.getMember(memberId);
}

function createEvent(eventData) {

  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const event = JSON.parse(eventData);
  
  const response = eventManager.addEvent(event); // assumes addEvent creates a new record and calendar event
  return JSON.stringify(response);
}

function updateEvent(eventData) {

  const modelFactory = Membership.newModelFactory();
  const event = JSON.parse(eventData);
  const eventManager = modelFactory.eventManager();
  const eventInstance = eventManager.createEvent(event);
  const response = eventManager.updateEvent(eventInstance);
  return JSON.stringify(response);
}

function getInstructors() {
  const modelFactory = Membership.newModelFactory();
  const membershipManager = modelFactory.membershipManager();
  const instructors = membershipManager.getInstructors();
  return JSON.stringify(instructors);
}

function getEventRooms() {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  // If getCalendarResources is a static method, call as CalendarManager.getCalendarResources()
  // If it's an instance method, call as calendarManager.getCalendarResources()
  // Here, assuming it's a static method as in your previous implementation:
  const resources = eventManager.getEventRooms();
  return JSON.stringify(resources);
}
