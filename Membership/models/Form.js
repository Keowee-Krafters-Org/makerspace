/**
 * Base Class representing a GoogleForm
 * Each form that requires specific processing should subclass Form and implement the abstract methods
 * @extends Entity
 */

class Form extends Entity {
    constructor(formData = {}) {
        super(formData);
    }

    /**
     * 
     * @returns the map of the class fields to the external record
     */
    static getToRecordMap() {
        return {
            id: 'id',
            title: (form) => form.getTitle,
            description: (form) => form.getDescription,
            responseItems: (form) => form.getResponseItems
        };
    }
}