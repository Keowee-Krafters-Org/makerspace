/**
 * Factory wrapper for exposing constructors across Apps Script library boundaries
 */

function makeResponse(success, data = {}, message, error) {
  return new Response(success, data, message, error);
}

function makeMember(data = {}) {
  return new Member(data);
}

function makeLogin(data = {}) {
  return new Login(data);
}

function makeRegistration(data = {}) {
  return new Registration(data);
}

function makeStorageManager(storageName) {
  return new StorageManager(storageName); 
}


function makeEventManager() {
  return new EventManager(makeStorageManager('events'), SharedConfig.events);
}
function makeEvent(data = {}) {
  return new Event(data);
}