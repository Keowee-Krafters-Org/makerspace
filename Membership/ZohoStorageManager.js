/** 
 * Storage manage for Zoho Books and Zoho CRM.
 * This class handles the storage and retrieval of entity data in Zoho Books and Zoho CRM.
 * It provides methods to add, update, delete, and retrieve entity records.
 * Conversion to and from entity objects is handled through the provided class methods.
 * This class is designed to work with the Zoho API, specifically for managing entities such as customers, invoices, and other records.
 * 
 * @class ZohoStorageManager
 * @extends StorageManager
 * @param {string} storageName - The name of the storage to use.
 */

class ZohoStorageManager extends StorageManager {
  constructor(clazz) {
    super(clazz);
    this.zohoAPI = ZohoAPI.newZohoAPI();
  }

  /**
   * Get all entity records from Zoho Books and Zoho CRM.
   * @returns {Array} An array of entity records.   
   * @returns Response {Error} If the API call fails.
   * @example
   */
  getAll(params = {}) {
    const resourceName = this.clazz.getResourceNamePlural();
    const response = this.zohoAPI.getEntities(resourceName, { contact_type: 'customer', ...params });
    if (!response || !response[resourceName]) {
      throw new Error(`No data found for resource: ${resourceName}`);
    }
    const entities = response[resourceName].map(row => this.clazz.fromRecord(row));
    return new Response(response.message === 'success', entities, response.message);
  }
  /**
   * Adds a new entity record to Zoho Books and Zoho CRM.
   * @param {Object} entity - The entity data to add.
   * @returns {Object} The added entity record with an ID.
   */
  add(entity) {
    // Implementation for adding a entity to Zoho Books and Zoho CRM
    // This would typically involve making API calls to Zoho services
    return this.zohoAPI.add(entity);
  }

  /**
   * Retrieves a entity record by its ID from Zoho Books and Zoho CRM.
   * @param {string} id - The ID of the entity to retrieve.
   * @returns {Object} The retrieved entity record.
   */
  getById(id) {
    const resourceName = this.clazz.getResourceNamePlural();
    const response = this.zohoAPI.getEntity(resourceName, id);
    if (!response || !response[this.clazz.getResourceNameSingular()]) {
      return new Response(false, null, response ? response.message : 'Not found');
    }
    const entity = this.clazz.fromRecord(response[this.clazz.getResourceNameSingular()]);
    return new Response(true, entity, response.message);
  }

  update(id, updatedEntity) {
    // Implement update logic using this.zohoAPI
    throw new Error('update() must be implemented');
  }

  delete(id) {
    // Implement delete logic using this.zohoAPI
    throw new Error('delete() must be implemented');
  }

  getFiltered(predicate) {
    return this.getAll().filter(predicate);
  }

  getByKeyValue(key, value) {
    return this.getAll().filter(entity => entity[key] === value);
  }
}

