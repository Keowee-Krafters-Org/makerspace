/**
 * Class to store instructor information from Zoho Vendors.
 */
class ZohoInstructor extends Instructor {
  constructor(data = {}) {
    super(data);
  }

  static getResourceNamePlural() {
    return 'contacts';
  }

  static getResourceNameSingular() {
    return 'contact';
  }

  static getFilter() {
    return {}; 
  }

  static getToRecordMap() {
    return {
      id: 'contact_id',
      firstName: 'first_name',
      lastName: 'last_name',
      emailAddress: 'email',
      phoneNumber: 'mobile',
      companyName: 'company_name',
      instructor: 'cf_instructor',
      name: 'contact_name'
    };
  }

  static fromRecord(record) {
      const data = ZohoInstructor.convertRecordToData(record, ZohoInstructor.getFromRecordMap());
      return new ZohoInstructor(data);
  }

  toRecord() {
      return this.convertDataToRecord(ZohoInstructor.getToRecordMap());
  }
}
