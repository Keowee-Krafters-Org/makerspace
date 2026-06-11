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

} 