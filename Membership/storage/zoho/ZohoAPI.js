/**
 * This is a stub file for the ZohoAPI class.
 * It provides the necessary interface for the Membership project to compile,
 * but it does not contain any real implementation. The actual ZohoAPI
 * is expected to be provided in the final runtime environment.
 */

export class ZohoAPI {
    constructor() {
        // Placeholder constructor
    }

    static newZohoAPI() {
        return new ZohoAPI();
    }

    getEntities(resourceName, params) {
        console.warn(`STUB: ZohoAPI.getEntities called for ${resourceName}`);
        return { [resourceName]: [] };
    }

    createEntity(resourceName, payload, params) {
        console.warn(`STUB: ZohoAPI.createEntity called for ${resourceName}`);
        const resourceNameSingular = resourceName.slice(0, -1);
        return { [resourceNameSingular]: { id: 'stub-id', ...payload } };
    }

    getEntity(resourceName, id) {
        console.warn(`STUB: ZohoAPI.getEntity called for ${resourceName} with id ${id}`);
        const resourceNameSingular = resourceName.slice(0, -1);
        return { [resourceNameSingular]: { id } };
    }

    updateEntity(resourceName, id, payload) {
        console.warn(`STUB: ZohoAPI.updateEntity called for ${resourceName} with id ${id}`);
        const resourceNameSingular = resourceName.slice(0, -1);
        return { [resourceNameSingular]: { id, ...payload } };
    }

    deleteEntity(resourceName, id) {
        console.warn(`STUB: ZohoAPI.deleteEntity called for ${resourceName} with id ${id}`);
        return { code: 0, message: 'success' };
    }
}
