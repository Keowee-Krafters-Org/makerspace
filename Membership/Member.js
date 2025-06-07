class Member {
  constructor(data = {}) {
    this.id = data.id || data.contactId || ''; // Add id/contactId support
    this.emailAddress = this.validateEmail(data.emailAddress || '');
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.address = data.address || '';
    this.interests = data.interests || '';
    this.login = Login.fromObject(data.login);
    this.registration = Registration.fromObject(data.registration);
  }

  static getSingularResourceName() {return 'contact'};
  static getPluralResourceName() {return 'contacts'};

  // Email validation method
  validateEmail(email) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      console.warn(`Invalid email format: ${email}`);
      return '';
    }
    return email;
  }

  toObjectNoAuthentication() {
    const clone = { ...this };
    delete clone.login.authentication;
    return clone;
  }

  toObject() {
    return {
      id: this.id,
      emailAddress: this.emailAddress,
      firstName: this.firstName,
      lastName: this.lastName,
      login: this.login.toObject(),
      registration: this.registration.toObject()
    };
  }

  toRow() {
    const loginData = this.login.toObject(); 
    const registrationData = this.registration.toObject(); 
    return {
      id: this.id,
      emailAddress: this.emailAddress,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      level: registrationData.level,
      interests: this.interests,
      address: this.address,
      status: loginData.status,
      memberStatus: registrationData.status,
      waiverSigned: registrationData.waiverSigned, 
      waiverPdfLink: registrationData.waiverPdfLink,
      waiverDate: registrationData.waiverDate
    };
  }

  static fromRow(row = {}) {
    return new Member({
      ...row,
      id: row.id || row.contact_id || '',
      firstName: row.first_name || '', 
      lastName: row.last_name || '',
      emailAddress: row.email || '', 
      login: Login.fromRow(row),
      address: row.address || '',
      registration: Registration.fromRow(row)
    });
  }

  static fromObject(data = {}) {
    const member = new Member({
      ...data,
      id: data.id || data.contactId || '',
      registration: Registration.fromObject(data.registration),
      login: Login.fromObject(data.login)
    });
    return member;
  }
}