/**
 * Model of a Location.
 * This model represents a location where events can be held.
 * It includes properties such as name, address, and capacity.
 */

class Location extends Entity{
    constructor(data = {}) {
        super(data);
    }

    createNew(data = {}) {
        const location = super.createNew(data);
        location.name = data.name || '';
        location.address = data.address || '';
        location.capacity = data.capacity || 0;
        return location;
    }
    
}