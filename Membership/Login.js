/**
 * LookupState represents the current authentication and lookup status
 * of a member based on their email.
 */
class Login {
  constructor(data = {} ) {
    this.status = data.status || 'UNVERIFIED';
    this.authentication = data.authentication || null;
    this.errors = [];
  }

  addError(errorMessage) {
    this.errors.push(errorMessage);
  }

  isValid() {
    return this.found && this.status !== '' && !this.isExpired();
  }

  isLoggedIn() {
    return this.status === 'VERIFIED'; 
  }

  isExpired() {
    if (!this.authentication.expiration) return false;
    const expDate = new Date(this.authentication.expiration);
    return isNaN(expDate.getTime()) ? false : expDate < new Date();
  }
    toObject() {
    const clone = { ...this };
    delete clone.authentication;
    return clone;
  }

}


