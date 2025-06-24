// SheetMember: handles mapping to/from sheet rows

class SheetMember extends Member {
  constructor(data = {}) {
    super(data);
  }

  static fromRecord(row = {}) {
    return new SheetMember({
      id: row.id,
      emailAddress: row.emailAddress,
      firstName: row.firstName,
      lastName: row.lastName,
      phoneNumber: row.phoneNumber,
      address: row.address,
      interests: row.interests,
      login: Login.fromRecord(row),
      registration: Registration.fromRecord(row)
    });
  }

  toRecord() {
    const loginData = this.login.toObject();
    const registrationData = this.registration.toObject();
    return {
      id: this.id,
      emailAddress: this.emailAddress,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      level: registrationData.level,
      interests: this.interests,
      address: this.address,
      status: loginData.status,
      memberStatus: registrationData.status,
      waiverSigned: registrationData.waiverSigned,
      waiverPdfLink: registrationData.waiverPdfLink,
      waiverDate: registrationData.waiverDate
    };
  }

  static getResourceNameSingular() { return 'Member Registry'; }
  static getResourceNamePlural() { throw new Error('Not implmented'); }
  static getResourceId() { return '1VOY4Xv8wqn0P0SjeGX1612c0uMmgJxH4NHItY4pLHUM'; }
}