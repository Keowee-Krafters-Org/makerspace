/* global Membership */

function getEventList(params = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const eventsResponse = eventManager.getUpcomingClasses(params);
  return JSON.stringify(eventsResponse.toObject());
}

function signup(classId, memberId) {
  const eventManager = Membership.newModelFactory().eventManager();
  const response = eventManager.signup(classId, memberId);
  return JSON.stringify(response.toObject());
}

function getAllEvents(params = {}) {
  const eventManager = Membership.newModelFactory().eventManager();
  const eventsResponse = eventManager.getUpcomingClasses(params);
  return JSON.stringify(eventsResponse.toObject());
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
  const response = eventManager.addEvent(event);
  return JSON.stringify(response.toObject());
}

function updateEvent(eventData) {
  try {
    const eventManager = Membership.newModelFactory().eventManager();
    const event = JSON.parse(eventData);
    const eventInstance = eventManager.createEvent(event);
    const response = eventManager.updateEvent(eventInstance);
    return JSON.stringify(response.toObject());
  } catch (e) {
    throw new Error('Failed to parse event JSON: ' + e.message);
  }
}

// FIX: accept params (pageSize, pageToken, search, role filters, etc.)
function getInstructors(params = {}) {
  const modelFactory = Membership.newModelFactory();
  const membershipManager = modelFactory.membershipManager();
  const instructorsResponse = membershipManager.getInstructors(params);
  return JSON.stringify(instructorsResponse.toObject());
}

function getEventHosts(params = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  // If your EventManager reuses membershipManager, forward params similarly
  const hosts = eventManager.getEventHosts ? eventManager.getEventHosts(params) : modelFactory.membershipManager().getInstructors(params);
  return JSON.stringify({ success: true, data: hosts });
}

// FIX: propagate params for pagination/filtering
function getEventRooms(params = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const resources = eventManager.getEventRooms(params);
  return JSON.stringify({ success: true, data: resources });
}

function getEventLocations(params = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const locations = eventManager.getEventLocations(params);
  return JSON.stringify({ success: true, data: locations });
}

function getEventItemList(params = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const itemsResponse = eventManager.getEventItemList(params);
  return JSON.stringify(itemsResponse);
}

function getEventItemById(eventItemId) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const item = eventManager.getEventItemById(eventItemId);
  return JSON.stringify({ success: true, data: item });
}

function unregister(classId, memberId) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const response = eventManager.unregister(classId, memberId);
  return JSON.stringify(response);
}

function getEventById(eventId) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const event = eventManager.getEventById(eventId);
  return JSON.stringify({ success: true, data: event });
}

function getMembersFromContacts(contacts, params = {}) {
  const modelFactory = Membership.newModelFactory();
  const membershipManager = modelFactory.membershipManager();
  const members = membershipManager.getMembersFromContacts(contacts, params);
  return JSON.stringify({ success: true, data: members });
}

function getEventImages(eventId) {
  const mf = Membership.newModelFactory();
  const em = mf.eventManager();
  return JSON.stringify({ success: true, data: em.getEventImages(eventId) });
}

function addEventImage(eventId, imageMetaJson) {
  const mf = Membership.newModelFactory();
  const em = mf.eventManager();
  const meta = typeof imageMetaJson === 'string' ? JSON.parse(imageMetaJson) : imageMetaJson;
  return JSON.stringify(em.addEventImage(eventId, meta));
}

function removeEventImage(eventId, fileId) {
  const mf = Membership.newModelFactory();
  const em = mf.eventManager();
  return JSON.stringify(em.removeEventImage(eventId, fileId));
}

function reorderEventImages(eventId, orderedIdsJson) {
  const mf = Membership.newModelFactory();
  const em = mf.eventManager();
  const ids = typeof orderedIdsJson === 'string' ? JSON.parse(orderedIdsJson) : orderedIdsJson;
  return JSON.stringify(em.reorderEventImages(eventId, ids));
}