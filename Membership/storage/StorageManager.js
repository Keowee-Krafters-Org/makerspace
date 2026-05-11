/**
 * @class StorageManager
 * @description Base class for storage managers (ZohoStorageManager, SheetStorageManager, etc).
 * Provides common interface and utility methods for entity storage.
 */
export class StorageManager {
    /**
     * @param {Function} clazz - The class constructor for the entity type managed by this storage manager.
     */
    constructor(clazz) {
        this.clazz = clazz;
    }

    /**
     * Adds an entity to the storage.
     * To be implemented by subclasses.
     */
    add(entity) {
        throw new Error('add() must be implemented by subclass');
    }

    /**
     * Retrieves an entity by its ID.
     * To be implemented by subclasses.
     */
    getById(id) {
        throw new Error('getById() must be implemented by subclass');
    }

    /**
     * Updates an entity by its ID.
     * To be implemented by subclasses.
     */
    update(id, updatedEntity) {
        throw new Error('update() must be implemented by subclass');
    }

    /**
     * Deletes an entity by its ID.
     * To be implemented by subclasses.
     */
    delete(id) {
        throw new Error('delete() must be implemented by subclass');
    }

    /**
     * Retrieves all entities.
     * To be implemented by subclasses.
     */
    getAll() {
        throw new Error('getAll() must be implemented by subclass');
    }

    /**
     * Retrieves entities filtered by a predicate function.
     * To be implemented by subclasses.
     */
    getFiltered(predicate, params = {}) {
        throw new Error('getFiltered() must be implemented by subclass');
    }

    /**
     * Gets entities using a single equality match pair.
     * To be implemented by subclasses.
     */
    getByKeyValue(key, value) {
        throw new Error('getByKeyValue() must be implemented by subclass');
    }

    create(data = {}) {
      throw new Error('create() must be implemented by subclass');
    }

    /**
     * A generic retry function with exponential backoff.
     * @param {Function} fn The function to execute.
     * @param {string} functionName A descriptive name for the function being tried, for logging.
     * @param {number} maxRetries The maximum number of retries.
     * @returns {*} The result of the function if successful.
     * @throws The last error if all retries fail.
     */
    retry(fn, functionName = 'unnamed function', maxRetries = 5) {
        let lastError = null;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return fn();
            } catch (e) {
                lastError = e;
                if (i < maxRetries - 1) {
                    const waitTime = Math.pow(2, i) * 1000 + Math.round(Math.random() * 1000);
                    console.warn(`Attempt ${i + 1} failed for ${functionName}. Retrying in ${waitTime}ms...`);
                    Utilities.sleep(waitTime);
                }
            }
        }
        console.error(`Failed to execute ${functionName} after ${maxRetries} attempts.`);
        throw lastError;
    }
}