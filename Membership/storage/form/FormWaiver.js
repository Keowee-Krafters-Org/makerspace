class FormWaiver extends Waiver{
  constructor(waiverData = {}) {
    super(waiverData);
  }

  static getResourceNameSingular() { return 'waiver'; }
  static getResourceNamePlural() { return 'waivers'; }  

  static getFormId() {
    return SharedConfig.forms.waiver.formId; 
  }
    /**
   * Maps Zoho CRM record fields to ZohoMember data fields.
   * @returns {Object} The mapping object for Zoho CRM record fields.
   */
  static getToRecordMap() {
    return {
      id: 'id', // Document ID
      pdfLink: 'pdfLink', // Link to the PDF document
      firstName: 'First Name',
      lastName: 'Last Name',
      signature: 'Signature',
      emailAddress: 'Email Address',
      timestamp: 'timestamp'
    };
  }

  static fromRecord(record = {}) {
    const data = super.convertRecordToData(record, this.getFromRecordMap());
    return new Waiver(data);
  }
}