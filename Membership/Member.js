class Member {
  constructor(data = {}) {
    this.emailAddress = this.validateEmail(data.emailAddress || '');
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.address = data.address || '';
    this.interests = data.interests || '';
    this.login = Login.fromObject(data.login);
    this.registration = Registration.fromObject(data.registration);
  }

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
      login: Login.fromRow(row),
      registration: Registration.fromRow(row)
    });
  }

  static fromObject(data = {}) {
  const member = new Member({
    ...data,
    registration: Registration.fromObject(data.registration),
    login: Login.fromObject(data.login)
  });

  return member;
}

}