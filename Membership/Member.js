class Member {
  constructor(data = {}) {
    this.emailAddress = this.validateEmail(data.emailAddress || '');
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.address = data.address || '';
    this.interests = data.interests || '';
    this.level = data.level || 0;
    this.login = new Login(data);
    this.registration = new Registration(data);
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

  toObject() {
    const clone = { ...this };
    delete clone.login.authentication;
    return clone;
  }
}