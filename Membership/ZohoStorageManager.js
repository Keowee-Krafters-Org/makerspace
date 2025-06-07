/** 
 * Storage manage for Zoho Books and Zoho CRM.
 * This class handles the storage and retrieval of member data in Zoho Books and Zoho CRM.
 * It provides methods to add, update, delete, and retrieve member records.
 * @class ZohoStorageManager
 * @extends StorageManager
 * @param {string} storageName - The name of the storage to use.
 */

class ZohoStorageManager {
  constructor() {
    this.zohoAPI = ZohoAPI.newZohoAPI();
  }

  /**
   * Get all member records from Zoho Books and Zoho CRM.
   * @returns {Array} An array of member records.   
   * @returns Response {Error} If the API call fails.
   * @example
   */
  getAll(clazz, params) {
    // Implementation for retrieving all instances from Zoho Books and Zoho CRM
    // This would typically involve making API calls to Zoho services
    const resourceName = clazz.getPluralResourceName(); 
    const response =  this.zohoAPI.getEntities(resourceName, {contact_type: 'customer',...params});
    if (response.code > 0) {
      return (response); 
    }
    // Assuming response contains a property named 'resourceName' that holds the data

    if (!response || !response[resourceName]) {
      throw new Error(`No data found for resource: ${resourceName}`);
    }
    // Extracting the entities from the response
    // This assumes the response structure is consistent with the Zoho API documentation
    if (!response[resourceName] || !Array.isArray(response[resourceName])) {
      throw new Error(`Invalid response format for resource: ${resourceName}`);
    }
    // Return the array of member records
    // This assumes that the response structure is consistent with the Zoho API documentation
    // and that the member records are stored under the resourceName property
    // If the response structure is different, adjust the extraction accordingly
    const entities = response[resourceName].map(row => clazz.fromRow(row));
    return new Response(response.message==='success', entities, response.message);
  }
  /**
   * Adds a new member record to Zoho Books and Zoho CRM.
   * @param {Object} member - The member data to add.
   * @returns {Object} The added member record with an ID.
   */
  add(member) {
    // Implementation for adding a member to Zoho Books and Zoho CRM
    // This would typically involve making API calls to Zoho services
    return this.zohoAPI.add(member);
  }

  /**
   * Retrieves a member record by its ID from Zoho Books and Zoho CRM.
   * @param {string} id - The ID of the member to retrieve.
   * @returns {Object} The retrieved member record.
   */
  getById(clazz, id) {
    // Implementation for retrieving a member from Zoho Books and Zoho CRM
    const resourceName = clazz.getPluralResourceName(); 
    const response =  this.zohoAPI.getEntity(resourceName, id);
    if (response.code > 0) {
      return (new Response(response.message==='success', null, response.message));
    } 
    
    const entity = clazz.fromRow(response[clazz.getSingularResourceName()]);
    return new Response(response.code === 0, entity, response.message); 
  }

}

  // Additional methods for updating, deleting, and filtering records can be added here