class Registration {
  constructor(data = {}) {
    this.level = data.level || 1;
    // Initialize registration status; default to 'NEW' if not provided
    this.status = data.status || 'NEW';
    // Set waiverSigned; ensure it's a boolean; default to false
    this.waiverSigned = typeof data.waiverSigned === 'boolean' ? data.waiverSigned : false;
    // Set waiverDate; validate if it's a proper date
    this.waiverDate = this.validateDate(data.waiverDate);
    // Initialize waiverPdfLink; default to empty string if not provided
    this.waiverPdfLink = data.waiverPdfLink || '';
  }

  static getPluralResourceName() {
    return 'registrations';
  }
  static getSingularResourceName() {
    return 'registration';
  }

  // Method to validate dates; returns null if invalid
  validateDate(date) {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  // Method to convert the current object state to a plain object, ensuring state encapsulation
  toObject() {
    return {
      status: this.status,
      level: this.level,
      waiverSigned: this.waiverSigned,
      waiverDate: this.waiverDate,
      waiverPdfLink: this.waiverPdfLink
    };
  }

  static fromObject(data) {
    return new Registration(data ? { ...data } : {});
  }

  static fromRow(row) {
    return new Registration(
      {

        status: row.cf_member_status || '',
        level: Registration.getLevel(row.cf_member_level),
        waiverSigned: row.cf_waiver_signed === 'TRUE',
        waiverDate: row.cf_waiver_date ? new Date(row.cf_waiver_date) : null,
        waiverPdfLink: row.cf_waiver_pdf_link || ''
      }
    );
  }

  static getLevel(levelString) {
    for (const key in SharedConfig.levels) {
      if (SharedConfig.levels[key] === levelString) {
        return key;
      }
    }
    return null; // Return null if no matching level is found
  }
}