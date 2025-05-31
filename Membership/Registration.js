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
    return new Registration(data?{...data}:{}); 
  }

  static fromRow(row) {
    return new Registration({...row, status: row.memberStatus}) ;
  }
}