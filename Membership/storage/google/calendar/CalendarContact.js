/**
 * Represents a contact (attendee) in the Google Calendar system.
 * This class extends the base Contact class to include additional properties
 * and methods specific to Google Calendar attendees.
 */
class CalendarContact extends Contact {
  constructor(data = {}) {
    super(data);
  }

  /**
   * Creates a new CalendarContact instance with the provided data.
   * @param {Object} data - The data to initialize the contact.
   * @returns {CalendarContact} A new CalendarContact instance.
   */
  createNew(data = {}) {
    const contact = super.createNew(data);
    contact.emailAddress = data.email || '';
    return contact;
  }

  /**
   * Converts the CalendarContact instance to a record suitable for Google Calendar.
   * @returns {Object} A record object for Google Calendar.
   */
  toRecord() {
    return {
      email: this.emailAddress,
    };
  }

  /**
   * Maps Google Calendar attendee fields to CalendarContact fields.
   * @param {Object} record - The Google Calendar attendee record.
   * @returns {CalendarContact} A CalendarContact instance.
   */
  static fromRecord(record = {}) {
    return new CalendarContact({
      emailAddress: record.email || ''
    });
  }
}