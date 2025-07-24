function getEventList() {

  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const events = eventManager.getUpcomingClasses();
  return JSON.stringify({ success: true, data: events });
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

  try {
    
  const eventManager = Membership.newModelFactory().eventManager();
    const event = JSON.parse(eventData);
    const eventInstance = eventManager.createEvent(event);

    const response = eventManager.updateEvent(eventInstance);
    return JSON.stringify(response);
  } catch (e) {
    throw new Error('Failed to parse event JSON: ' + e.message);
  }

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

function getEventLocations() {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  // Assuming getEventLocations is a method that returns an array of locations
  const locations = eventManager.getEventLocations();
  return JSON.stringify(locations);
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

function unregister(classId, memberId) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();

  // Call the eventManager's method to unregister the member
  const response = eventManager.unregister(classId, memberId);

  return JSON.stringify(response);
}

function getEventById(eventId) {
    const modelFactory = Membership.newModelFactory();
    const eventManager = modelFactory.eventManager();
    const event = eventManager.getEventById(eventId);
    return JSON.stringify({ success: true, data: event });
}