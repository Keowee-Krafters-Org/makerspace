import { Contact } from "@makerspace/membership-common";

export class ZeffyContact extends Contact {
    constructor(props) {
        super(props);
        this.id = props.id;
        this.firstName = props.firstName;
        this.lastName = props.lastName;
        this.email = props.email;
        this.phone = props.phone;
    }

    static getResourceNameSingular() {
        return this.getResourceNamePlural();
    }

    static getResourceNamePlural() {
        return 'contacts'; // Zeffy uses "contacts" for contact entities
    }

    static getToRecordMap() {
        return {
            id: 'id',
            firstName: 'first_name',
            lastName: 'last_name',
            emailAddress: 'email',
            phoneNumber: 'phone',
            // compatibility aliases used in some legacy paths
            email: 'email',
            phone: 'phone',
            name: 'name',
        };
    }

} 