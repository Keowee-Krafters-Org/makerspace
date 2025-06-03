
/** 
 * Module supporting Calendar operations
 */
const CALENDAR_ID = 'c_c9ac4bc31b22e9a6e15052c53064118f252e4e5559b82af3fe49378559fbb672@group.calendar.google.com';
const CalendarModule = {
  createEvent: function(eventData) {
    return Calendar.Events.insert(eventData, CALENDAR_ID);
  },

  updateEvent: function(eventData, eventId) {
    return Calendar.Events.update(eventData, CALENDAR_ID, eventId);
  },

  deleteEvent: function(eventId) {
    return Calendar.Events.remove(CALENDAR_ID, eventId);
  },

  getEvent: function(eventId) {
    return Calendar.Events.get(CALENDAR_ID, eventId);
  }
};

