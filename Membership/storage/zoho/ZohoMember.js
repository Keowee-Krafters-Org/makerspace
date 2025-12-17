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



  static createNew(data = {}) {
    const member = super.createNew(data);
    member.name = `${member.firstName} ${member.lastName}`
    member.contacts = data.contacts || [];
    member.login = ZohoLogin.fromObject(data.login || { status: 'UNVERIFIED' }),
    member.registration = ZohoRegistration.fromObject(data.registration || { status: 'NEW' })
    return member;
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
    return { contactType: 'customer', isMember: true };
  }

  /**
   * Maps Zoho CRM record fields to ZohoMember data fields.
   * @returns {Object} The mapping object for Zoho CRM record fields.
   */
  static getToRecordMap() {
    return {
      id: 'contact_id',
      primaryContactId: 'primary_contact_id',
      name: 'contact_name',
      firstName: 'first_name',
      lastName: 'last_name',
      emailAddress: 'email',
      phoneNumber: 'mobile', 
      contacts: 'contact_persons',
      contactType: 'contact_type',
      isMember: 'cf_is_member',
      interests: 'cf_interests',
      outstandingBalance: 'outstanding_receivable_amount', 
      host: 'cf_host',
      instructor: 'cf_instructor',
//      address: 'billing_address'
    };
  }

  /**
   * Converts a Zoho CRM record into a ZohoMember instance.
   * @param {Object} [record={}] - The Zoho CRM record to convert.
   * @returns {ZohoMember} A new ZohoMember instance with the converted data.
   */
  static fromRecord(record = {}) {
    const data = super.convertRecordToData(record, this.getFromRecordMap());
    data.login = ZohoLogin.fromRecord(record);
    data.registration = ZohoRegistration.fromRecord(record);
    data.id = record.id || record.contact_id || '';
    data.discount = MembershipManager.calculateDiscount(data);
    // If interests is a string, split it into an array
    if (typeof record.cf_interests === 'string') {
      data.interests = record.cf_interests.split(',').map(s => s.trim());
    }
    data.contacts = record.contact_persons ? record.contact_persons.map(c => ZohoContact.fromRecord(c)) : [];
    return new this(data);
  }

  /**
   * Converts the ZohoMember instance data into a Zoho CRM record format.
   * @returns {Object} The Zoho CRM record object.
   */
  toRecord() {
    const primaryContact = new ZohoContact ({
      firstName: this.firstName, 
      lastName: this.lastName, 
      emailAddress: this.emailAddress,
      phoneNumber: this.phoneNumber,
//      address: this.address
    }); 
    // Append contacts items past index 1 to the contacts array
    if (Array.isArray(this.contacts) && this.contacts.length > 1) {
      this.contacts = [primaryContact, ...this.contacts.slice(1)];
    } else {
      this.contacts = [primaryContact];
    }
    this.name = `${this.firstName} ${this.lastName}`;
    const record = this.convertDataToRecord(this.constructor.getToRecordMap());

    record.customer_name = this.name;
    record.contact_type = 'customer';
    record.customer_sub_type = 'individual';

    // Use the root data to create the contacts list
    // Append contacts items past index 1 to the contacts array
    if (Array.isArray(this.contacts) && this.contacts.length > 1) {
      this.contacts = [primaryContact, ...this.contacts.slice(0)];
    } else {
      this.contacts = [primaryContact];
    }
    record.contact_persons = this.contacts.map(c => c.toRecord())
    Object.assign(record, this.login ? this.login.toRecord() : {});
    Object.assign(record, this.registration ? this.registration.toRecord() : {});
    return record;
  }
}