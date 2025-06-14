/**
 * ZohoLogin class extends Login and represents a login entity in Zoho CRM.
 * Provides mapping between Zoho CRM records and ZohoLogin instances.
 */
class ZohoLogin extends Login {
  constructor(data = {}) {
    super(data);
  }

  /**
   * Returns the singular resource name for Zoho CRM.
   * @returns {string}
   */
  static getResourceNameSingular() {
    return 'login';
  }

  /**
   * Returns the plural resource name for Zoho CRM.
   * @returns {string}
   */
  static getResourceNamePlural() {
    return 'logins';
  }

  /**
   * Returns the filter criteria for fetching login records from Zoho CRM.
   * @returns {Object}
   */
  static getFilter() {
    return { cf_type: 'Login' };
  }

  /**
   * Maps Zoho CRM record fields to ZohoLogin data fields.
   * @returns {Object}
   */
  static getToRecordMap() {
    return {
      status: 'cf_login_status',
      authentication: 'cf_authentication',
      lastLogin: 'cf_last_login'
      // Add other mappings as needed
    };
  }

  // Inherit getFromRecordMap from Entity (auto-reverses getToRecordMap)

  /**
   * Converts a Zoho CRM record into a ZohoLogin instance.
   * @param {Object} [record={}]
   * @returns {ZohoLogin}
   */
  static fromRecord(record = {}) {
    const data = this.convertRecordToData(record, this.getFromRecordMap());
    if (data.lastLogin) data.lastLogin = new Date(data.lastLogin);
    // If authentication is stored as JSON string, parse it
    if (typeof data.authentication === 'string') {
      try {
        data.authentication = JSON.parse(data.authentication);
      } catch (e) {
        // leave as string if not JSON
      }
    }
    return new this(data);
  }

  /**
   * Converts the ZohoLogin instance data into a Zoho CRM record format.
   * @returns {Object}
   */
  toRecord() {
    const record = this.convertDataToRecord(this.constructor.getToRecordMap());
    // If authentication is an object, stringify it for storage
    if (record.authentication && typeof record.authentication === 'object') {
      record.authentication = JSON.stringify(record.authentication);
    }
    return record;
  }
}