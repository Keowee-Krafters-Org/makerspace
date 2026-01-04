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
            // Access getters/setters on the prototype chain (not just own props)
            if (key in this) {
                try {
                    const value = this[key]; // invokes getter if present
                    if (value !== undefined) {
                        record[toRecordMap[key]] = value;
                    }
                } catch (e) {
                    // If a getter throws, skip mapping that key
                }
            }
        });
        return record;
    }

    static convertRecordToData(record = {}, fromRecordMap) {
        const data = {};
        // Iterate mapping keys to avoid dropping falsy values and ensure consistent mapping
        Object.keys(fromRecordMap || {}).forEach(storeKey => {
            const modelKey = fromRecordMap[storeKey];
            // Include value if the key exists in record, even if falsy (0, false, '')
            if (storeKey in record) {
                const value = record[storeKey];
                if (value !== undefined) {
                    data[modelKey] = value;
                }
            }
        });
        return data;
    }

    // Helper: serialize arbitrary values with recursion for entities/arrays/maps/sets/dates
    static serializeValue(value) {
        if (value == null) return value;
        if (typeof value === 'function') return undefined;

        // Entity subclass instance
        if (value && typeof value === 'object' && typeof value.toObject === 'function') {
            return value.toObject();
        }

        // Date
        if (value instanceof Date) {
            return isNaN(value.getTime()) ? null : value.toISOString();
        }

        // Array
        if (Array.isArray(value)) {
            return value.map(v => Entity.serializeValue(v)).filter(v => v !== undefined);
        }

        // Map
        if (value instanceof Map) {
            const obj = {};
            value.forEach((v, k) => { obj[String(k)] = Entity.serializeValue(v); });
            return obj;
        }

        // Set
        if (value instanceof Set) {
            return Array.from(value).map(v => Entity.serializeValue(v));
        }

        // Plain object
        if (value && typeof value === 'object') {
            const out = {};
            Object.keys(value).forEach(k => {
                if (k.startsWith('_')) return;
                const v = value[k];
                const sv = Entity.serializeValue(v);
                if (sv !== undefined) out[k] = sv;
            });
            return out;
        }

        // Primitive
        return value;
    }

    // Build a full object snapshot:
    // 1) all non-underscore own fields
    // 2) all getter-backed fields on the prototype chain
    // 3) recursive serialization of nested Entities/collections
    toObject() {
        const out = {};

        // 1) Include all own, enumerable fields except those starting with '_'
        Object.keys(this).forEach(k => {
            if (k.startsWith('_')) return;
            const v = this[k];
            const sv = Entity.serializeValue(v);
            if (sv !== undefined) out[k] = sv;
        });

        // 2) Include getters from prototype chain (without overwriting existing keys unless undefined)
        let proto = Object.getPrototypeOf(this);
        const seen = new Set(Object.keys(out));
        while (proto && proto !== Object.prototype) {
            const descriptors = Object.getOwnPropertyDescriptors(proto);
            Object.entries(descriptors).forEach(([name, desc]) => {
                if (!desc || typeof desc.get !== 'function') return;
                if (name.startsWith('_')) return;
                if (seen.has(name)) return; // already set from own data
                try {
                    const val = this[name]; // invoke getter
                    const sv = Entity.serializeValue(val);
                    if (sv !== undefined) {
                        out[name] = sv;
                        seen.add(name);
                    }
                } catch { /* ignore getter errors */ }
            });
            proto = Object.getPrototypeOf(proto);
        }

        // Ensure timestamps are serialized consistently if present
        if ('createdAt' in this && out.createdAt == null) {
            out.createdAt = Entity.serializeValue(this.createdAt);
        }
        if ('updatedAt' in this && out.updatedAt == null) {
            out.updatedAt = Entity.serializeValue(this.updatedAt);
        }

        return out;
    }

    toString() {
        return JSON.stringify(this.toObject());
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