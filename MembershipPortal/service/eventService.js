/* global Membership */

function getEventList(paramsString = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const params = typeof paramsString === 'string' ? JSON.parse(paramsString) : paramsString;  
  const eventsResponse = eventManager.getUpcomingEvents(params);
  
  return JSON.stringify(eventsResponse.toObject());
}

function signup(classId, memberId) {
  const eventManager = Membership.newModelFactory().eventManager();
  const response = eventManager.signup(classId, memberId);
  return JSON.stringify(response.toObject());
}

/**
 * Get all events including classes
 * @param {*} paramsString 
 * @returns 
 */
function getAllEvents(paramsString = {}) { 
  const eventManager = Membership.newModelFactory().eventManager();
  const params = typeof paramsString === 'string' ? JSON.parse(paramsString) : paramsString;  
  const eventsResponse = eventManager.getUpcomingEvents(params);
  return JSON.stringify(eventsResponse.toObject());
}

/**
 * Get all classes
 * @param {*} paramsString 
 * @returns 
 */
function getAllClasses(paramsString = {}) { 
  const eventManager = Membership.newModelFactory().eventManager();
  const params = typeof paramsString === 'string' ? JSON.parse(paramsString) : paramsString;  
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

function deleteEvent(eventId) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const response = eventManager.deleteEvent({id: eventId});
  return JSON.stringify(response.toObject());
}


function getInstructors(paramsString = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  // If your EventManager reuses membershipManager, forward params similarly
  const params = typeof paramsString === 'string' ? JSON.parse(paramsString) : paramsString;  
  const instructorsResponse = eventManager.getInstructors(params);
  return JSON.stringify(instructorsResponse.toObject());
}

function getEventHosts(paramsString = {}) {
  const modelFactory = Membership.newModelFactory();
  const membershipManager = modelFactory.membershipManager();
  // If your EventManager reuses membershipManager, forward params similarly
  const params = typeof paramsString === 'string' ? JSON.parse(paramsString) : paramsString;  
  const hostsResponse = membershipManager.getHosts(params);
  return JSON.stringify(hostsResponse.toObject());
}

// FIX: propagate params for pagination/filtering
function getEventRooms(paramsString = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const params = typeof paramsString === 'string' ? JSON.parse(paramsString) : paramsString;  
  const resourcesResponse = eventManager.getEventRooms(params);
  return JSON.stringify(resourcesResponse.toObject());
}
  
function getEventLocations(paramsString = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const params = typeof paramsString === 'string' ? JSON.parse(paramsString) : paramsString;  
  const locationsResponse = eventManager.getEventLocations(params);
  return JSON.stringify(locationsResponse.toObject());
}

function getEventItemList(paramsString = {}) {
  const modelFactory = Membership.newModelFactory();
  const eventManager = modelFactory.eventManager();
  const params = typeof paramsString === 'string' ? JSON.parse(paramsString) : paramsString;  
  const itemsResponse = eventManager.getEventItemList(params);
  return JSON.stringify(itemsResponse.toObject());
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