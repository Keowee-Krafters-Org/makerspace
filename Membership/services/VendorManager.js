/**
 * VendorManager.js
 * 
 * This service manages vendor-related operations, including creating new vendor instances
 * and retrieving vendor data from the storage system.
 * Instructors are considered vendors in this context.
 */
class VendorManager {
  /**
   * @param {StorageManager} storageManager - An instance of a storage manager (e.g., ZohoStorageManager)
   */
  constructor(storageManager) {
    this.storageManager = storageManager;
  }

  getAllVendors(params = {}) {
    return this.storageManager.getAll(params);
  }

  getVendor(id) {
    return this.storageManager.getById(id);
  }
  createNew(data = {}) {
    return this.storageManager.createNew(data);
  }
  
}
