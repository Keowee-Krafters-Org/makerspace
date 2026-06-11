
import { ZeffyAPI } from "../ZeffyAPI";
import { StorageManager } from "@makerspace/membership-common";
import { ZeffyResponse } from "./ZeffyResponse.js";
import { ZeffyPage } from "./ZeffyPage.js";
export class ZeffyStorageManager extends StorageManager {
    /**
     * @param {Function} clazz - The entity class (constructor) to use for mapping data.
     * @param {Object} [runtimeZeffyApi] - Optionally provide a ZeffyAPI instance or factory.
     */
    constructor(clazz, runtimeZeffyApi = null) {
        super(clazz);
        this.clazz = clazz;
        this.zeffyApi = runtimeZeffyApi && typeof runtimeZeffyApi.newZeffyAPI === 'function'
            ? runtimeZeffyApi.newZeffyAPI()
            : new ZeffyAPI();
        // Optionally, define resourceName if your API is resource-based
        this.resourceName = this.clazz.getResourceNamePlural ? this.clazz.getResourceNamePlural() : null;
        this.resourceNameSingular = this.clazz.getResourceNameSingular ? this.clazz.getResourceNameSingular() : null;
    }

    /**
     * Add a new entity via ZeffyAPI
     */
    add(entityData, params = {}) {
        throw new Exception("Not Implemented");
    }

    /**
     * Get an entity by ID
     */
    getById(id) {
        const response = this.zeffyApi.getEntity(this.resourceName, id);
        if (!response || !response[this.resourceNameSingular]) {
            return null;
        }
        return this.clazz.fromRecord ? this.clazz.fromRecord(response[this.resourceNameSingular]) : new this.clazz(response);
    }

    /**
     * Update an entity by ID
     */
    update(id, updatedEntity) {
        throw new Exception("Not Implemented");
    }

    /**
     * Delete an entity by ID
     */
    delete(id) {
        throw new Exception("Not Implemented");
    }

    /**
     * Get all entities, handling pagination if needed
     */
    getAll(params = {}) {
        const pagedata = params.page? new ZeffyPage(params.page).toRecord() : {};
        return this.zeffyApi.getEntities(this.resourceName, { ...params, ...this.clazz.getFilter?.() || {}, ...pagedata })
            .then(response => {
                const items = (response.data && response.data.length > 0)
                    ? response.data.map(itemData => this.clazz.fromRecord ? this.clazz.fromRecord(itemData) : new this.clazz(itemData))
                    : [];
                const page = ZeffyPage.fromRecord({
                    ...response,
                    pageSize: items.length,
                    currentPageMarker: params.starting_after || null
                });
                return new ZeffyResponse(true, items, '', '', page);
            });
    }

    /**
     * Get filtered entities using a predicate function
     */
    getFiltered(predicate, params = {}) {
        if (typeof predicate !== 'function') {
            throw new Error('Predicate must be a function');
        }
        return this.getAll(params).then(allItems => allItems.filter(predicate));
    }

    /**
     * Get entities by key-value pair
     */
    getByKeyValue(key, value) {
        return this.getAll({ [key]: value });
    }

    /**
     * Create a new entity instance (not persisted)
     */
    create(data = {}) {
        return new this.clazz(data);
    }

    /**
     * Optionally, create a new entity using a static method if available
     */
    createNew(data = {}) {
        return this.clazz.createNew ? this.clazz.createNew(data) : new this.clazz(data);
    }
}
