/**
 * Base Class representing a GoogleForm
 * Each form that requires specific processing should subclass Form and implement the abstract methods
 * @extends Entity
 */

class Form extends Entity {
    constructor(formData = {}) {
        super(formData);
    }

    static getToRecordMap() {
        return {
            id: 'id',
            title: (form) => form.title,
            description: (form) => form.description
        };
    }
}