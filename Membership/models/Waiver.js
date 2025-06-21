/**
 * Waiver class representing a waiver entity.
 * Extends the base Entity class for common entity functionality.
 * @extends Entity
 */
class Waiver extends Entity{
  constructor(waiverData = {}) {
    super(waiverData);
  }
   
  static createNew(waiverData = {}) {
    return new Waiver({
      ...waiverData,
      timestamp: waiverData.timestamp || new Date(), 
      id: waiverData.id || '',
      pdfLink: waiverData.pdfLink || '',
      firstName: waiverData.firstName || '',
      lastName: waiverData.lastName || '',
      signature: waiverData.signature || '',
      emailAddress: waiverData.emailAddress || ''
    });
  }
}