/** 
 * Storage manager for Zoho Books and Zoho CRM.
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
    this.resourceName = this.clazz.getResourceNamePlural();
    this.resourceNameSingular = this.clazz.getResourceNameSingular();
    this.filter = this.clazz.getFilter();
  }

  /**
   * Get all entity records from Zoho Books and Zoho CRM.
   * @returns {Array} An array of entity records.   
   * @returns Response {Error} If the API call fails.
   * @example
   */
  getAll(params = {}) {
    const response = this.zohoAPI.getEntities(this.resourceName,{...params, ...this.filter}); 
    if (!response || !response[this.resourceName]) {
      throw new Error(`No data found for resource: ${this.resourceName}`);
    }
    const entities = response[this.resourceName].map(row => this.clazz.fromRecord(row));
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
    const response = this.zohoAPI.getEntity(this.resourceName, id);
    if (!response || !response[this.resourceNameSingular]) {
      return new Response(false, null, response ? response.message : 'Not found');
    }
    const entity = this.clazz.fromRecord(response[this.resourceNameSingular]);
    return new Response(true, entity, response.message);
  }

  update(id, updatedEntity) {
    // Implement update logic using this.zohoAPI
    const record = updatedEntity.toRecord();
    const payload = {};
    if (updatedEntity.id) {
      delete updatedEntity.id; // Ensure id is not included in the update payload
    }
    payload[this.resourceNameSingular] = record;
    const response = this.zohoAPI.updateEntity(this.resourceName, id, payload);
    if (!response || !response[this.resourceNameSingular]) {
      throw new Error(`Failed to update entity with ID: ${id} with: response.message`);
    }
    const updatedRecord = this.clazz.fromRecord(response[this.resourceNameSingular]);
    return new Response(true, updatedRecord, response.message);
  }

  delete(id) {
    // Implement delete logic using this.zohoAPI
    throw new Error('delete() must be implemented');
  }

  getFiltered(predicate,params = {}, ) {
    if (typeof predicate !== 'function') {
      throw new Error('Predicate must be a function');
    }
    const allResponse = this.getAll( params);
   
    if (allResponse.error) {
      throw new Error(allResponse.message || 'Error retrieving data');
    }
    // Filter the data using the provided predicate function
    allResponse.data = allResponse.data.filter(predicate);
    return allResponse;
  }

  getByKeyValue(key, value) {
    return this.getAll().filter(entity => entity[key] === value);
  }
}

