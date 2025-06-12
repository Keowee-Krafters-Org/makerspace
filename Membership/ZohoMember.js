class ZohoMember extends Member {
  constructor(data = {}) {  
    super(data);
  }

  static getResourceNameSingular() { return 'contact'; }
  static getResourceNamePlural() { return 'contacts'; }
  static getFilter() { return { contact_type: 'customer', cf_is_member: true }; } 

  static fromRecord(record = {}) {
    return new ZohoMember({
      ...record,
      id: record.id || record.contact_id || '',
      firstName: record.first_name || '', 
      lastName: record.last_name || '',
      emailAddress: record.email || '', 
      phoneNumber: record.phone || '',
      address: record.address || '',
      interests: record.cf_interests || '',
      login: Login.fromRecord(record),
      registration: Registration.fromRecord(record)
    });
  }

  toRecord() {
    const loginData = this.login.toObject(); 
    const registrationData = this.registration.toObject(); 
    return {
      contact_id: this.id,
      email: this.emailAddress,
      first_name: this.firstName,
      last_name: this.lastName,
      phone: this.phoneNumber,
      address: this.address,
      cf_interests: this.interests,
      ...loginData,
      ...registrationData
    };
  }
}