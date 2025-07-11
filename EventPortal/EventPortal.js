/**
 * Open the index page
 */
function doGet(e) {
  const modelFactory = Membership.newModelFactory();
  // Deafault member object
  // This is used when the user is not logged in or has not provided a memberId
  let member = {firstName: 'Anonymous', lastName: 'Guest', registration: {status: 'NOT_REGISTERED', level: 'Guest'}, login: {status: 'NOT_VERIFIED'}};
  
  let canSignup = false;

  if (e.parameter.memberId) {
    const response = getMember(e.parameter.memberId);
    if (response.success) {
      const authentication = response.data.login.authentication;
      const isValid = new Date() < new Date(authentication.expirationTime);
      if (isValid) {
        member = response.data;
        delete member.login.authentication.token;
        canSignup = true;
      }
    }
  }

  const eventManager = modelFactory.eventManager();

  const template = HtmlService.createTemplateFromFile('index');
  template.member = member;
  template.sharedConfig = modelFactory.config;
  template.canSignup = canSignup;
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

function getEventItemList() {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const items = eventManager.getEventItemList();
  return JSON.stringify(items);
} 

function getEventItemById(eventItemId) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const item = eventManager.getEventItemById(eventItemId);
  return JSON.stringify(item);
}

