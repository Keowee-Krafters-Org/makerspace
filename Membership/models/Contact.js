/**
 * Class to store contact information for members
 *  - primary contact is the member
 *  - other contacts might be emergency contact,  spouse, parent etc
 */

class Contact extends Entity {
    constructor(data = {}) {
        super(data);
    }

}