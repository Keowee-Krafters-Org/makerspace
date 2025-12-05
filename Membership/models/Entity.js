/** 
 * Base class for Membership entities.
 * Provides common properties and methods for all entities.
 * Specific entities (e.g., Member, Event) should extend this class.
 * 
 */

 class Entity {
    constructor(data = {}) {
        Object.keys(data).forEach(key => {
            let value = data[key]; 
            if (key.includes('date')) {
                value = new Date(value); 
            }
            this[key] = value;
        });
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }

    static fromObject(obj = {}) {
        return new this(obj);
    }


    static getStorageKey(key) {
        const toRecordMap = this.getToRecordMap();
        return toRecordMap[key] || key;
    }

    // Datasource-specific resource names
    static getResourceNameSingular() {
        throw new Error('Implemented in subclass');
    }

    static getResourceNamePlural() {
        throw new Error('Implemented in subclass');
    }
    /**
     * Factory method for creating a fully initialized new entity.
     * Subclasses should override this to provide required defaults.
     * @param {Object} data
     * @returns {Entity}
     */
    static createNew(data = {}) {
        // By default, just call the constructor; subclasses should override for required fields
        return new this(data);
    }

    getId() {
        return this.id;
    }

    // Generic mapping helpers
    convertDataToRecord(toRecordMap) {
        const record = {};
        Object.keys(toRecordMap).forEach(key => {
            // Map even falsey values; only skip if property truly absent/undefined
            if (Object.prototype.hasOwnProperty.call(this, key) && this[key] !== undefined) {
                record[toRecordMap[key]] = this[key];
            }
        });
        return record;
    }

    static convertRecordToData(record = {}, fromRecordMap) {
        const data = {};
        Object.keys(record).forEach(key => {
            if (fromRecordMap[key]) data[fromRecordMap[key]] = record[key];
        });
        return data;
    }

    toObject() {
        return {
            id: this.id,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    toString() {
        return `[Entity ${this.id}]`;
    }

    // Abstract mapping accessors for subclasses to implement
    static getFromRecordMap() {
        // Reverse the key-value pairs of getToRecordMap
        const toMap = this.getToRecordMap();
        return Object.fromEntries(Object.entries(toMap).map(([k, v]) => [v, k]));
    }

 

    touch() {
        this.updatedAt = new Date();
    }

    clone() {
        return new this.constructor(this.toObject());
    }

    // Abstract methods for storage mapping
    static fromRecord(record) {
        return new this(this.convertRecordToData(record,this.getFromRecordMap())); 
    }

    toRecord() {
         return this.convertDataToRecord(this.constructor.getToRecordMap())
    }
}