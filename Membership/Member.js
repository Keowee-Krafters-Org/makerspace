// Member.js — Structured Member class used throughout the app

class Member {
  constructor(data = {}) {
    this.emailAddress = data.emailAddress || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.address = data.address || '';
    this.interests = data.interests || '';
    this.level = data.level || 0;
    this.login = new Login(data); 
    this.registration = new Registration(data); 
  }

 

  toObject() {
    const clone = { ...this };
    delete clone.login.authentication;
    return clone;
  }
}
