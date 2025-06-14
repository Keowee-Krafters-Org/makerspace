/**
 * Factory wrapper for exposing constructors across Apps Script library boundaries
 */


function newResponse(success, data = {}, message, error) {
  return new Response(success, data, message, error);
}

function newMember(data = {}) {
  return new Member(data);
}

function newLogin(data = {}) {
  return new Login(data);
}

function newRegistration(data = {}) {
  return new Registration(data);
}

function newEventManager() {
  return new EventManager(new ZohoStorageManager(ZohoEvent));
}

function newMembershipManager() {
  return new MembershipManager(new ZohoStorageManager(ZohoMember));
}
function newEvent(data = {}) {
  return new Event(data);
}

