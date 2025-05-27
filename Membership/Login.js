class Login {
  constructor(data = {}) {
    this.status = data.status || 'UNVERIFIED';
      this.authentication = parseAuthenticationEntry(data.authentication) || {};
    this.errors = [];
    this.found = data.hasOwnProperty('found') ? data.found : false;
  }

  // Method to add an error message to the errors list
  addError(errorMessage) {
    this.errors.push(errorMessage);
  }

  // Method to check if the login is valid
  isValid() {
    return this.found && this.status !== '' && !this.isExpired();
  }

  // Method to check if the user is logged in
  isLoggedIn() {
    return this.status === 'VERIFIED'; 
  }

  // Method to check if the authentication is expired
  isExpired() {
    const expiration = this.authentication.expiration;
    if (!expiration) return false;
    
    const expDate = new Date(expiration);
    return isNaN(expDate.getTime()) ? false : expDate < new Date();
  }

  // Method to convert the object to a plain object
  toObject() {
    const clone = { ...this };
    delete clone.authentication;
    return clone;
  }
}



