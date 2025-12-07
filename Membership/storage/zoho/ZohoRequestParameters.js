/**
 * ZohoRequestParameters
 * 
 * Represents request parameters for Zoho API requests.
 * Contains a Page object for handling pagination parameters.
 */

class ZohoRequestParameters extends Entity {
  constructor(clazz, params = {}) {
    super(params);
    this.clazz = clazz;
    // Expect a Page instance or plain object at params.page
    const pageData = params.page || {};
    this.page = pageData instanceof Page ? pageData : new ZohoPage(pageData);
  }

  setParam(key, value) { this[key] = value; }
  getParam(key) { return this[key]; }
  getAllParams() { return this.toObject(); } // fix: call the method

  toRecord() {
    // Base entity params via class mapping
    const base = this.convertDataToRecord(this.clazz.getToRecordMap?.() || {});
    // Page params via Page.toRecord (ZohoPage implements it)
    const pageRec = this.page ? this.page.toRecord() : {};
    // Merge flat request params
    return { ...base, ...pageRec };
  }

  static fromRecordWithClass(record) {
    throw new Error('ZohoRequestParameters.fromRecordWithClass should not be called directly');
  }
}