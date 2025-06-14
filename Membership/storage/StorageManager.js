/**
 * @class StorageManager
 * @description Base class for storage managers (ZohoStorageManager, SheetStorageManager, etc).
 * Provides common interface and utility methods for entity storage.
 */
class StorageManager {
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
}