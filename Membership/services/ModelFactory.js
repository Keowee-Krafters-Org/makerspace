
/**
 * Factory class for creating and managing various models and services within the Membership application.
 * 
 * @class
 * @param {Object} config - Optional configuration object for service initialization.
 * 
 * @property {Object} config - The configuration object used for initializing services.
 * 
 * @example
 * const factory = new ModelFactory(appConfig);
 * const member = factory.member({ name: 'John Doe' });
 */
class ModelFactory {
  constructor(config) {
    this._config = config || {};
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
    const calendarId = this._config.services?.calendar?.defaultCalendarId;
    return new CalendarManager(calendarId);
  }

  eventManager() {
    return new EventManager(new ZohoStorageManager(ZohoEvent), 
    this.calendarManager(),
    this.membershipManager());
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

  /**
   * The system configuration
   * @returns the injected configuration file
   */
  get config() { 
    return this._config; 
  }

  set config(config ) {
    this._config = config;
  }
}

function newModelFactory() {
  return new ModelFactory(SharedConfig);
}

const modelFactory = newModelFactory() ;