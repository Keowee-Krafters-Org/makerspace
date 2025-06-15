class Login extends Entity {
  constructor(data = {}) {
    super(data);
    // Do not fully initialize here; allow partial instantiation for flexibility
    this.status = data.status;
    this.authentication = data.authentication;
    this.errors = data.errors || [];
    this.found = data.hasOwnProperty('found') ? data.found : false;
  }

  /**
   * Factory method for creating a fully initialized new Login.
   * Ensures required fields have sensible defaults.
   * @param {Object} data - Source object for initialization
   * @returns {Login}
   */
  static createNew(data = {}) {
    return new Login({
      ...data,
      status: typeof data.status === 'string' && data.status.trim() !== '' ? data.status : 'UNVERIFIED',
      authentication: typeof data.authentication === 'object' ? data.authentication : {},
      errors: Array.isArray(data.errors) ? data.errors : [],
      found: !!data.found
    });
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
    const expiration = this.authentication && (this.authentication.expiration || this.authentication.expirationTime);
    if (!expiration) return true;

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
      id: this.id,
      status: this.status,
      authentication: this.authentication,
      errors: this.errors,
      found: this.found
    };
  }

  /**
   * Create a Login from JSON object data
   */
  static fromObject(data) {
    return new Login(data ? { ...data } : {});
  }

  static parseAuthenticationEntry(authenticationEntry) {
    if (!authenticationEntry || authenticationEntry === '') return {};
    try {
      return typeof authenticationEntry === 'string'
        ? JSON.parse(authenticationEntry)
        : authenticationEntry;
    } catch (e) {
      return {};
    }
  }
}

// Make the class globally accessible in Google Apps Script
this.Login = Login;



