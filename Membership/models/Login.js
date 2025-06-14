class Login {
  constructor(data = {}) {
    this.status = data.status || 'UNVERIFIED';
    this.authentication = data.authentication || {};
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
  toObjectNoAuthentication() {
    const clone = { ...this };
    delete clone.authentication;
    return clone;
  }

  toObject() {
    return {
      status: this.status,
      authentication: this.authentication
    };
  }

  /**
   * Create a Login from JSON object data
   */
  static fromObject(data) {
    return new Login(data?{...data, authentication: data.authentication}:{}); 
  }

  static fromRecord(row) {
    return new Login(
      {...row, 
      status: row.cf_login_status || 'UNVERIFIED',
      authentication: row.cf_authentication?Login.parseAuthenticationEntry(row.cf_authentication):{}
    }); 
  }

  static parseAuthenticationEntry(authenticationEntry) {
  return (authenticationEntry && authenticationEntry != '') ?
    JSON.parse(authenticationEntry) :
    generateAuthentication();
}
}



