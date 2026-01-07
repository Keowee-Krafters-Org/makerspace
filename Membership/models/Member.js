/**
 * Member.js
 * Represents a member with personal details, login, and registration info.
 * Extends the base Entity class.
 * @extends Entity
 */
class Member extends Contact {
  constructor(data = {}) {
    super(data)
  }

  // Use this only for new members (not for updates)
  static createNew(data = {}) {
    // Generate a unique name
    const lastName = data.lastName || `Member_${Math.floor(1000 + Math.random() * 9000)}`; 
    return new this({
      id: data.id || '', // or generate new ID if needed
      emailAddress: data.emailAddress || '',
      firstName: data.firstName || 'New',
      lastName: lastName,
      name: `${data.firstName} ${lastName}`, 
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      interests: data.interests || ''
    });
  }
 

  toObjectNoAuthentication() {
    const clone = { ...this };
    delete clone.login.authentication;
    return clone;
  }

  toObject() {
    return {...super.toObject(),
      interests: this.interests,
      host: this.host,
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