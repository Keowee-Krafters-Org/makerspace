/**
 * Class to store contact information for members in Zoho books 
 *  - primary contact is the member
 *  - other contacts are spouse, parent etc
 */

class ZohoContact extends Contact {
    constructor(data = {}) {
        super(data);
    }

    // Resource for direct access
    getResourceNamePlural() {
        return 'contacts/${this.id}/contactpersons'; 
    }

    getResourceNameSingular() {
        return 'contact_person'; 
    }

  /**
   * Maps Zoho Books record fields to ZohoMember data fields.
   * @returns {Object} The mapping object for Zoho CRM record fields.
   */
  static getToRecordMap() {
    return {
      memberId: 'contact_id', 
      id: 'contact_person_id',
      firstName: 'first_name',
      lastName: 'last_name',
      emailAddress: 'email',
      phoneNumber: 'phone',
      address: 'address',
    };
  }

  
}