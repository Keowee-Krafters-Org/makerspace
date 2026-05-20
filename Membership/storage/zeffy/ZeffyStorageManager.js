import { ZeffyPayment } from "./ZeffyPayment";
import { ZeffyAPI } from "../../ZeffyAPI/ZeffyAPI";

export class ZeffyStorageManager extends StorageManager {
    constructor() {
        super(ZeffyPayment);
        this.zeffyApi = newZeffyAPI();
    }

    add(entity) {
        // Implement Zeffy add logic
        throw new Error('add() not implemented for ZeffyStorageManager');
    }

    getById(id) {
        // Implement Zeffy getById logic
        throw new Error('getById() not implemented for ZeffyStorageManager');
    }

    update(id, updatedEntity) {
        // Implement Zeffy update logic
        throw new Error('update() not implemented for ZeffyStorageManager');
    }

    delete(id) {
        // Implement Zeffy delete logic
        throw new Error('delete() not implemented for ZeffyStorageManager');
    }

    async getAll() {
        let allItems = [];
        let hasMore = true;
        let cursor = undefined;

        while (hasMore) {
            const response = await this.zeffyApi.getPayments({ limit: 100, starting_after: cursor });
            if (response.data && response.data.length > 0) {
                const items = response.data.map(itemData => new this.clazz(itemData));
                allItems = allItems.concat(items);
            }
            hasMore = response.has_more;
            cursor = response.next_cursor;
        }
        return allItems;
    }

    getFiltered(predicate, params = {}) {
        // Implement Zeffy getFiltered logic
        throw new Error('getFiltered() not implemented for ZeffyStorageManager');
    }

    getByKeyValue(key, value) {
        // Implement Zeffy getByKeyValue logic
        throw new Error('getByKeyValue() not implemented for ZeffyStorageManager');
    }

    create(data = {}) {
      // Implement Zeffy create logic
      throw new Error('create() not implemented for ZeffyStorageManager');
    }
}
