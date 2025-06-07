/**
 * @class IStorageManager
 * @description An abstract class that delegates to an implementor instance.
 * Pass the implementor instance to the constructor. Each method defers to the implementor.
 */
class StorageManager {
    constructor(implementor) {
        if (!implementor) {
            throw new Error("Implementor instance required");
        }
        this.impl = implementor;
    }

    /**
     * Create an object from the given row data.
     * @className {class} clazz - The class to create an instance from.
     * @param {Array} row - The row data as an array.
     * @returns {Object} - The row data as an object.
     */

    objectFromRow(clazz, row) {
        const obj = {};
        for (const key in clazz.colMap) {
            if (clazz.colMap.hasOwnProperty(key)) {
                const index = clazz.colMap[key];
                obj[key] = row[index];
            }
        }
        return clazz.fromRow(obj);
    }

    /**
     * Adds a record to the storage.
     * @param {Object} record - The record to add.
     * @returns {Object} The added record with an ID.
     */
    add(record) {
        return this.impl.add(record);
    }
    /**
     * Retrieves a record by its ID.
     * @param {string} id - The ID of the record to retrieve.
     * @returns {Object} The retrieved record.
     */
    getById(id) {
        return this.impl.getById(id);
    }
    /**
     * Updates a record by its ID.
     * @param {string} id - The ID of the record to update.
     * @param {Object} updatedRecord - The updated record data.
     * @returns {Object} The updated record.
     */
    update(id, updatedRecord) {
        return this.impl.update(id, updatedRecord);
    }
    /** 
     * Deletes a record by its ID.
     * @param {string} id - The ID of the record to delete.
     * @returns {boolean} True if the record was deleted, false otherwise.
     */
    delete(id) {
        return this.impl.delete(id);
    }
    /**
     * Retrieves all records.
     * @returns {Array} An array of all records.
     */
    getAll() {
        return this.impl.getAll();
    }
    /**
     * Retrieves records filtered by a predicate function.
     * @param {Function} predicate - A function that takes a record and returns true if it matches the criteria.
     * @returns {Array} An array of records that match the predicate.
     */
    getFiltered(predicate) {
        return this.impl.getFiltered(predicate);
    }   
    /**
     * Gets records using a single equality match pair
     * @param {string} key - The key to match.
     * @param {any} value - The value to match.
     * @returns {Array} An array of records that match the key-value pair.  
     */
    getByKeyValue(key, value) {
        return this.impl.getByKeyValue(key, value);
    }
}