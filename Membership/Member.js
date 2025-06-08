class Member {
  constructor(data = {}) {
    this.id = data.id || data.contactId || '';
    this.emailAddress = this.validateEmail(data.emailAddress || '');
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.address = data.address || '';
    this.interests = data.interests || '';
    this.login = Login.fromObject(data.login);
    this.registration = Registration.fromObject(data.registration);
  }

  // Common validation and utility methods
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
      phoneNumber: this.phoneNumber,
      address: this.address,
      interests: this.interests,
      login: this.login.toObject(),
      registration: this.registration.toObject()
    };
  }

  static fromObject(data = {}) {
    return new Member({
      ...data,
      id: data.id || data.contactId || '',
      registration: Registration.fromObject(data.registration),
      login: Login.fromObject(data.login)
    });
  }

  // Storage-agnostic extension points
  static fromRecord(record) {
    throw new Error('Implemented in subclass');
  }

  toRecord() {
    throw new Error('Implemented in subclass');
  }

  // Datasource-specific resource names
  static getResourceNameSingular() {
    throw new Error('Implemented in subclass');
  }

  static getResourceNamePlural() {
    throw new Error('Implemented in subclass');
  }
}