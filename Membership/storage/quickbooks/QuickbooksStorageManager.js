import { StorageManager } from "../StorageManager";

export class QuickbooksStorageManager extends StorageManager {
    constructor(clazz) {
        super(clazz);
    }

    add(entity) {
        // Implement Quickbooks add logic
    }

    getById(id) {
        // Implement Quickbooks getById logic
    }

    update(id, updatedEntity) {
        // Implement Quickbooks update logic
    }

    delete(id) {
        // Implement Quickbooks delete logic
    }

    getAll() {
        // Implement Quickbooks getAll logic
    }

    getFiltered(predicate, params = {}) {
        // Implement Quickbooks getFiltered logic
    }

    getByKeyValue(key, value) {
        // Implement Quickbooks getByKeyValue logic
    }

    create(data = {}) {
      // Implement Quickbooks create logic
    }
}
