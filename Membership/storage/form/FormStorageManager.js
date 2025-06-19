/**
 * FormStorageManager is responsible for managing the storage of form data.
 * It provides methods to retrieve form records.
 * This class is designed to work with Google FormsApp
 */
class FormStorageManager extends StorageManager {
    constructor(formClass) {
        this.formClass = formClass;
    }
    /**
     * Retrieves all form records.
     * @returns {Array} An array of form records.
     */
    async getAll() {
        const records = await this.formClass.getAllRecords();
        return records.map(record => this.formClass.fromRecord(record));
    }
    /**
     * Retrieves a form record by its ID.
     * @param {string} id - The ID of the form record.
     * @returns {Object|null} The form record if found, otherwise null.
     */
    getById(id) {
        try {
            // Open the Google Form by its ID
            const form = FormApp.openById(id);

            // Create a record object with the form's metadata
            const record = {
                id: id,
                title: form.getTitle(),
                description: form.getDescription(),
                items: form.getItems().map(item => ({
                    id: item.getId(),
                    title: item.getTitle(),
                    type: item.getType()
                }))
            };

            // Use the fromRecord class method to instantiate a FormWaiver object
            return this.formClass.fromRecord(record);
        } catch (error) {
            throw new Error(`Failed to retrieve form with ID: ${id}. Error: ${error.message}`);
        }
    }
}