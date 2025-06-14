/**
 * ZohoRegistration class extends Registration and represents a registration entity in Zoho CRM.
 * Provides mapping between Zoho CRM records and ZohoRegistration instances.
 */
class ZohoRegistration extends Registration {
  constructor(data = {}) {
    super(data);
  }

  /**
   * Returns the singular resource name for Zoho CRM.
   * @returns {string}
   */
  static getResourceNameSingular() {
    return 'registration';
  }

  /**
   * Returns the plural resource name for Zoho CRM.
   * @returns {string}
   */
  static getResourceNamePlural() {
    return 'registrations';
  }

  /**
   * Returns the filter criteria for fetching registration records from Zoho CRM.
   * @returns {Object}
   */
  static getFilter() {
    return { cf_type: 'Registration' };
  }

  /**
   * Maps Zoho CRM record fields to ZohoRegistration data fields.
   * @returns {Object}
   */
  static getToRecordMap() {
    return {
      status: 'cf_registration_status',
      waiverSigned: 'cf_waiver_signed',
      date: 'cf_registration_date',
      level: 'cf_member_level'
      // Add other mappings as needed
    };
  }

  // Inherit getFromRecordMap from Entity (auto-reverses getToRecordMap)

  /**
   * Converts a Zoho CRM record into a ZohoRegistration instance.
   * @param {Object} [record={}]
   * @returns {ZohoRegistration}
   */
  static fromRecord(record = {}) {
    const data = this.convertRecordToData(record, this.getFromRecordMap());
    if (data.date) data.date = new Date(data.date);
    data.waiverSigned = data.waiverSigned==='true'?true:false; 
    return new this(data);
  }

  /**
   * Converts the ZohoRegistration instance data into a Zoho CRM record format.
   * @returns {Object}
   */
  toRecord() {
    const record =  this.convertDataToRecord(this.constructor.getToRecordMap());
    record.cf_waiver_signed = record.cf_waiver_signed===true?'true': 'false'; 
    return record; 
  }
}