class Registration extends Entity {
  constructor(data = {}) {
    super(data);
  }

  static getResourceNamePlural() {
    return 'registrations';
  }
  static getResourceNameSingular() {
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
      id: this.id,
      status: this.status,
      level: this.level,
      waiverSigned: this.waiverSigned,
      waiverDate: this.waiverDate,
      waiverPdfLink: this.waiverPdfLink
    };
  }

  static fromObject(data) {
    return new this(data ? { ...data } : {});
  }

  static getToRecordMap() {
    return {
      id: 'registration_id',
      status: 'cf_member_status',
      level: 'cf_member_level',
      waiverSigned: 'cf_waiver_signed',
      waiverDate: 'cf_waiver_date',
      waiverPdfLink: 'cf_waiver_pdf_link'
    };
  }

  // Inherit getFromRecordMap from Entity (auto-reverses getToRecordMap)

  static fromRecord(row) {
    const data = this.convertRecordToData(row, this.getFromRecordMap());
    data.waiverSigned = data.waiverSigned === true || data.waiverSigned === 'TRUE';
    data.waiverDate = data.waiverDate ? new Date(data.waiverDate) : null;
    return new this(data);
  }

  static getLevel(levelString) {
    return SharedConfig.levels[levelString].value;
  }
}