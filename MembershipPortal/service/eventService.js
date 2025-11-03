function getEventList(params={}) {

  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const events = eventManager.getUpcomingClasses(params);
  return JSON.stringify({ success: true, data: events });
}


function signup(classId, memberId, startIso) {

  const eventManager = Membership.newModelFactory().eventManager();
  const response = eventManager.signup(classId, memberId, startIso);
  return JSON.stringify(response);
}

function getAllEvents(page) {
  const eventManager = Membership.newModelFactory().eventManager();
    const events = eventManager.getUpcomingClasses(page);
  return JSON.stringify({ success: true, data: events });
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

  const response = eventManager.addEvent(event); // Assumes addEvent creates a new record and calendar event
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

  // Fetch all event rooms
  const resources = eventManager.getEventRooms(); 
  return JSON.stringify({ success: true, data: resources });
}

function getEventLocations() {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  // Assuming getEventLocations is a method that returns an array of locations
  const locations = eventManager.getEventLocations();
  return JSON.stringify(locations);
}

function getEventItemList(params={}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const items = eventManager.getEventItemList(params);
  return JSON.stringify(items);
}

function getEventItemById(eventItemId) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const item = eventManager.getEventItemById(eventItemId);
  return JSON.stringify(item);
}

function unregister(classId, memberId, startIso) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();

  const response = eventManager.unregister(classId, memberId, startIso);
  return JSON.stringify(response);
}

function getEventById(eventId) {
    const modelFactory = Membership.newModelFactory();
    const eventManager = modelFactory.eventManager();
    const event = eventManager.getEventById(eventId);
    return JSON.stringify({ success: true, data: event });
}

function getMembersFromContacts(contacts) {
  const modelFactory = Membership.newModelFactory();
  const membershipManager = modelFactory.membershipManager();
  const members = membershipManager.getMembersFromContacts(contacts);
  return JSON.stringify({success:true, data:members});
}

