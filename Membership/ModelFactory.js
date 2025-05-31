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
