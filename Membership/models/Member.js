/**
 * Member.js
 * Represents a member with personal details, login, and registration info.
 * Extends the base Entity class.
 * @extends Entity
 */
class Member extends Entity {
  constructor(data = {}) {
    super(data)
  }

  // Use this only for new members (not for updates)
  static createNew(data = {}) {
    return new this({
      id: data.id || '', // or generate new ID if needed
      emailAddress: data.emailAddress || '',
      firstName: data.firstName || 'New',
      lastName: data.lastName || 'Member',
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      interests: data.interests || ''
    });
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

}