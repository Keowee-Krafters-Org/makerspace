class Registration {
  constructor(data = {}) {
    this.status = data.memberStatus || 'NEW'; 
    this.waiverSigned = data.waiverSigned;
    this.waiverDate = data.waiverDate; 
    this.waiverPdfLink = data.waiverPdfLink; 
  }

    toObject() {
    return this; 
  }
}
