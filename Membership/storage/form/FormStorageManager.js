/**
 * FormStorageManager is responsible for managing the storage of form data.
 * It provides methods to retrieve form records.
 * This class is designed to work with Google FormsApp
 */
class FormStorageManager extends StorageManager {
    constructor(formClass) {
        super(formClass);
        this.form = FormApp.openById(formClass.getFormId());
    }
    /**
     * Retrieves all form records.
     * @returns {Array} An array of form records.
     */
    async getAll() {
        const configForms = SharedConfig.forms;
        const forms = configForms.map(cf => {
            return this.getById(cf.id);
        });
        return forms.map(record => this.formClass.fromRecord(record));
    }
    /**
     * Retrieves a form record by its ID.
     * @param {string} id - The ID of the form record.
     * @returns {Object|null} The form record if found, otherwise null.
     */
    getById(id) {
        try {
            // Open the Google Form by its ID
            const form = this.form;

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
            return this.clazz.fromRecord(record);
        } catch (error) {
            throw new Error(`Failed to retrieve form with ID: ${id}. Error: ${error.message}`);
        }
    }
    /**
  * Finds a form response by the respondent's email.
  * @param {string} formId - The ID of the form.
  * @param {string} email - The email of the respondent.
  * @returns {Object|null} The form response if found, otherwise null.
  */
    getResponseByEmail(email) {
        // Check if the form is collecting email addresses
        const form = this.form; 
        if (form.getEmailCollectionType() != 'DO_NOT_COLLECT') {
            const responses = form.getResponses();
            for (const response of responses) {
                if (response.getRespondentEmail && response.getRespondentEmail() === email) {
                    return response;
                }
            }
        } else {
            const responses = form.getResponses();
            for (const response of responses) {
                const items = response.getItemResponses();
                for (const item of items) {
                    if (
                        item.getItem().getTitle().toLowerCase().includes('email') &&
                        item.getResponse().toLowerCase() === email.toLowerCase()
                    ) {
                        return response;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Transform the responseItems from a straight array to an object
     * @param {*} response 
     * @returns {Object} An object mapping question titles to answers, plus a timestamp
     */
    getResponseData(response) {
        const itemResponseArray = response.getItemResponses();
        const itemResponses = {};
        for (const item of itemResponseArray) {
            // Use the question title as the key and the response as the value
            itemResponses[item.getItem().getTitle()] = item.getResponse();
        }
        itemResponses.timestamp = response.getTimestamp();
        return itemResponses;
    }

}