/**
 * Class to store contact information for members
 *  - primary contact is the member
 *  - other contacts might be emergency contact,  spouse, parent etc
 */

 class Contact extends Entity {
    constructor(data = {}) {
        super(data);
    }

    toObjectNoAuthentication() {
    const clone = { ...this };
    delete clone.login.authentication;
    return clone;
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

    toObject() {
    return {
      id: this.id,
      emailAddress: this.emailAddress,
      firstName: this.firstName,
      lastName: this.lastName,
      name: this.firstName + ' ' + this.lastName,
      phoneNumber: this.phoneNumber,
      address: this.address
    };
  }
  
 
}