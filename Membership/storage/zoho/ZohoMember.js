// ZohoMember class extends Member and represents a member entity in Zoho CRM
/**
 * Represents a member in Zoho CRM, extending the base Member class.
 * Provides functionality to map Zoho CRM records to ZohoMember instances and vice versa.
 * Includes methods for resource naming, filtering, and record conversion.
 */
class ZohoMember extends Member {
  /**
   * Initializes a ZohoMember instance with the provided data.
   * @param {Object} [data={}] - The data to initialize the ZohoMember instance.
   */
  constructor(data = {}) {  
    super(data);
  }

  /**
   * Retrieves the singular resource name for Zoho CRM.
   * @returns {string} The singular resource name ('contact').
   */
  static getResourceNameSingular() { 
    return 'contact'; 
  }

  /**
   * Retrieves the plural resource name for Zoho CRM.
   * @returns {string} The plural resource name ('contacts').
   */
  static getResourceNamePlural() { 
    return 'contacts'; 
  }

  /**
   * Retrieves the filter criteria for fetching member records from Zoho CRM.
   * @returns {Object} The filter criteria object.
   */
  static getFilter() { 
    return { contact_type: 'customer', cf_is_member: true }; 
  }

  /**
   * Maps Zoho CRM record fields to ZohoMember data fields.
   * @returns {Object} The mapping object for Zoho CRM record fields.
   */
  static getToRecordMap() {
    return {
      id: 'contact_id',
      firstName: 'first_name',
      lastName: 'last_name',
      emailAddress: 'email',
      phoneNumber: 'phone',
      address: 'address',
      interests: 'cf_interests'
    };
  }

  /**
   * Converts a Zoho CRM record into a ZohoMember instance.
   * @param {Object} [record={}] - The Zoho CRM record to convert.
   * @returns {ZohoMember} A new ZohoMember instance with the converted data.
   */
  static fromRecord(record = {}) {
    const data = this.convertRecordToData(record, this.getFromRecordMap());
    data.login = Login.fromRecord(record);
    data.registration = Registration.fromRecord(record);
    data.id = record.id || record.contact_id || '';
    return new this(data);
  }

  /**
   * Converts the ZohoMember instance data into a Zoho CRM record format.
   * @returns {Object} The Zoho CRM record object.
   */
  toRecord() {
    const record = this.convertDataToRecord(this.constructor.getToRecordMap());
    Object.assign(record, this.login ? this.login.toObject() : {});
    Object.assign(record, this.registration ? this.registration.toObject() : {});
    return record;
  }
}