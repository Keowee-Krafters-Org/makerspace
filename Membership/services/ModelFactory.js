/**
 * Factory wrapper for exposing constructors across Apps Script library boundaries
 */

class ModelFactory {
  constructor(config) {
    this.config = config || {};
  }
  response(success, data = {}, message, error) {
    return new Response(success, data, message, error);
  }

  member(data = {}) {
    return new Member(data);
  }

  login(data = {}) {
    return new Login(data);
  }

  registration(data = {}) {
    return new Registration(data);
  }

  calendarManager() {
    const calendarId = this.config.service?.calendar?.defaultCalendarId;
    return new CalendarManager(calendarId);
  }

  eventManager() {
    return new EventManager(new ZohoStorageManager(ZohoEvent), this.calendarManager());
  }

  membershipManager() {
    return new MembershipManager(new ZohoStorageManager(ZohoMember));
  }

  event(data = {}) {
    return new Event(data);
  }

  waiverManager() {
    return new WaiverManager(new FormStorageManager(FormWaiver), this.membershipManager());
  }
}

function newModelFactory() {
  return new ModelFactory(SharedConfig);
}
