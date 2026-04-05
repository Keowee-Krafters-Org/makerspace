import { Page } from '../../models/Page.js';
import { ZohoPage } from './ZohoPage.js';

/**
 * ZohoRequestParameters
 * 
 * Represents request parameters for Zoho API requests.
 * Contains a Page object for handling pagination parameters.
 */
import {Entity} from '../../models/Entity.js'; 

export class ZohoRequestParameters extends Entity {
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
    // Convert filter params to Zoho format
    const filterRec = this.processFilters();
    // Merge flat request params
    return { ...base, ...pageRec, ...filterRec };
  }

  processFilters() {
    if (!this.filters || !Array.isArray(this.filters)) return {};

    const processedFilters = {};

    this.filters.forEach(filter => {
      const { field, comparator, value } = filter;
      // Convert field name using the map, handling dot notation
      const mappedField = this.resolveMappedField(field);

      if (comparator === 'STARTS_WITH') {
        processedFilters[`${mappedField}_startswith`] = value;
      } else if (comparator === 'CONTAINS') {
        processedFilters[`${mappedField}_contains`] = value;
      } else {
        // Fallback for other comparators (e.g. EQUALS) or if comparator is missing
        processedFilters[mappedField] = value;
      }
    });

    return processedFilters;
  }

  resolveMappedField(field) {
    const clazz = this.clazz;
    // 1. Try direct mapping first (fast path)
    const directMap = clazz.getToRecordMap ? clazz.getToRecordMap() : {};
    if (directMap[field]) return directMap[field];

    // 2. Handle dot notation by inspecting object structure
    if (field.includes('.')) {
      // Create a dummy instance to traverse structure
      let instance = null;
      if (typeof clazz.createNew === 'function') {
        try { instance = clazz.createNew(); } catch (e) {}
      }
      if (!instance) {
        try { instance = new clazz(); } catch (e) {}
      }

      if (instance) {
        const parts = field.split('.');
        const mapped = this.resolveFieldRecursive(instance, parts);
        if (mapped) return mapped;
      }
    }

    // 3. Fallback to original field
    return field;
  }

  resolveFieldRecursive(obj, parts) {
    if (!obj || parts.length === 0) return null;

    const prop = parts[0];

    // If we are at the leaf property
    if (parts.length === 1) {
      if (obj.constructor && obj.constructor.getToRecordMap) {
        const map = obj.constructor.getToRecordMap();
        return map[prop] || prop;
      }
      return prop;
    }

    // Traverse deeper
    if (obj[prop]) {
      return this.resolveFieldRecursive(obj[prop], parts.slice(1));
    }

    // Path broken
    return null;
  }

  static fromRecordWithClass(record) {
    throw new Error('ZohoRequestParameters.fromRecordWithClass should not be called directly');
  }
}