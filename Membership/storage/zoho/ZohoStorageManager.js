import { StorageManager } from '../StorageManager.js';
import { ZohoRequestParameters} from './ZohoRequestParameters.js';
import { ZohoResponse } from './ZohoResponse.js'; 
import { Response } from '../../models/Response.js';

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

export class ZohoStorageManager extends StorageManager {
  constructor(clazz, runtimeZohoApi = null) {
    super(clazz);
    if (!runtimeZohoApi || typeof runtimeZohoApi.newZohoAPI !== 'function') {
      throw new Error('ZohoAPI runtime provider is required and must implement newZohoAPI().');
    }
    this.zohoAPI = runtimeZohoApi.newZohoAPI();
    this.resourceName = this.clazz.getResourceNamePlural();
    this.resourceNameSingular = this.clazz.getResourceNameSingular();
    this.filter = this.clazz.getFilter();
  }

  /**
   * Get all entity records from Zoho Books and Zoho CRM.
   * @returns {Array} An array of entity records.   
   * @returns Response {Error} If the API call fails - with pagination information.
   * @throws {Error} If the API call fails or no data is found.
   * @example
   */
  getAll(params = {}) {
    // Build request parameters with filters and optional Page
    const requestParams = new ZohoRequestParameters(
      this.clazz,
      { ...params, ...this.filter } // fix: spread params instead of {params,...}
    );

    // Get flat Zoho request params from DTO (includes page if provided)
    const zohoParams = requestParams.toRecord();


    // Execute request
    const response = this.retry(() => this.zohoAPI.getEntities(this.resourceName, zohoParams), 'ZohoAPI.getEntities');
    if (!response || !response[this.resourceName]) {
      throw new Error(`No data found for resource: ${this.resourceName}`);
    }

    // Map rows -> entities
    const entities = response[this.resourceName].map(row => this.clazz.fromRecord(row));

    return ZohoResponse.fromRecord(response, entities);
  }

  convertParams(clazz, params) {
    const toRecordMap = clazz.getToRecordMap();
    const zohoParams = {};
    Object.entries(params).forEach(([key, value]) => {
      const zohoKey = toRecordMap[key]
      zohoParams[zohoKey?zohoKey:key] = value;
    });
    return zohoParams;
  }
  /**
   * Adds a new entity record to Zoho Books and Zoho CRM.
   * @param {Object} entity - The entity data to add.
   * @returns {Object} The added entity record with an ID.
   */
  add(entityData, params = {}) {
    // Implementation for adding a entity to Zoho Books and Zoho CRM
    // This would typically involve making API calls to Zoho services
    let entity = entityData; 
    if(!entityData.toRecord) {
      // Create the entity from raw data
      entity = this.createNew(entityData) 
    }
    // Should not have an id
    delete entity.id;
    const entityRecord = entity.toRecord();
    const response = this.retry(() => this.zohoAPI.createEntity(this.clazz.getResourceNamePlural(), entityRecord, params), 'ZohoAPI.createEntity');
    return this.clazz.fromRecord(response[this.resourceNameSingular]);
  }

  /**
   * Retrieves a entity record by its ID from Zoho Books and Zoho CRM.
   * @param {string} id - The ID of the entity to retrieve.
   * @returns {Object} The retrieved entity record.
   */
  getById(id) {
    const response = this.retry(() => this.zohoAPI.getEntity(this.resourceName, id), 'ZohoAPI.getEntity');
    if (!response || !response[this.resourceNameSingular]) {
      return new Response(false, null, response ? response.message : 'Not found');
    }
    const entity = this.clazz.fromRecord(response[this.resourceNameSingular]);
    return new Response(true, entity, response.message);
  }

  update(id, updatedEntity) {
    // Implement update logic using this.zohoAPI
    if (updatedEntity.id) {
      delete updatedEntity.id; // Ensure id is not included in the update payload
    }

    const payload = updatedEntity.toRecord();
    const response = this.retry(() => this.zohoAPI.updateEntity(this.resourceName, id, payload), 'ZohoAPI.updateEntity');
    if (!response || !response[this.resourceNameSingular]) {
      throw new Error(`Failed to update entity with ID: ${id} with: ${response.message}`);
    }
    const savedEntity = this.clazz.fromRecord(response[this.resourceNameSingular]);
    savedEntity.id = id; // Ensure the ID is set correctly
    return new Response(true, savedEntity, response.message);
  }

  delete(id) {
    // Implement delete logic using this.zohoAPI
    return this.retry(() => this.zohoAPI.deleteEntity(this.resourceName,id), 'ZohoAPI.deleteEntity');
  }

  getFiltered(predicate, params = {},) {
    if (typeof predicate !== 'function') {
      throw new Error('Predicate must be a function');
    }
    const allResponse = this.getAll(params);

    if (allResponse.error) {
      throw new Error(allResponse.message || 'Error retrieving data');
    }
    // Filter the data using the provided predicate function
    allResponse.data = allResponse.data.filter(predicate);
    return allResponse;
  }

  getByKeyValue(key, value) {
    return this.getAll({ [key]: value});
  }

  createNew(data = {}) {
    return this.clazz.createNew(data);
  }

  create(data = {}) {
    return new this.clazz(data);
  }

}

export class ZohoMember {
  static getResourceNamePlural() {
    return 'contacts';
  }
  static getResourceNameSingular() {
    return 'contact';
  }
  static createNew(data) {
    return Member.createNew(data);
  }
  static fromRecord(record) {
    return Member.fromRecord(record);
  }
  static getFilter() {
    return {
      cf_entity_type: 'Member'
    }
  }
}

export class ZohoInvoice {
  static getResourceNamePlural() {
    return 'invoices';
  }
  static getResourceNameSingular() {
    return 'invoice';
  }
  static createNew(data) {
    return Invoice.createNew(data);
  }
  static fromRecord(record) {
    return Invoice.fromRecord(record);
  }
  static getFilter() {
    return {}
  }
}

export class ZohoEvent {
  static getResourceNamePlural() {
    return 'items';
  }
  static getResourceNameSingular() {
    return 'item';
  }
  static createNew(data) {
    return EventItem.createNew(data);
  }
  static fromRecord(record) {
    return EventItem.fromRecord(record);
  }
  static getFilter() {
    return {
      cf_entity_type: 'Event'
    }
  }
}

export class ZohoInstructor {
  static getResourceNamePlural() {
    return 'vendors';
  }
  static getResourceNameSingular() {
    return 'vendor';
  }
  static createNew(data) {
    return Instructor.createNew(data);
  }
  static fromRecord(record) {
    return Instructor.fromRecord(record);
  }
  static getFilter() {
    return {
      cf_entity_type: 'Instructor'
    }
  }
}

export class ZohoLogin {
  static getResourceNamePlural() {
    return 'logins';
  }
  static getResourceNameSingular() {
    return 'login';
  }
  static createNew(data) {
    return Login.createNew(data);
  }
  static fromRecord(record) {
    return Login.fromRecord(record);
  }
  static getFilter() {
    return {}
  }
}

