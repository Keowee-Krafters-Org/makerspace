import { Entity } from './Entity.js';
export class Member extends Entity{
    constructor(data = {}) {
        super(data.id);
        this.emailAddress = data.emailAddress || '';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.login = { status: 'UNVERIFIED' };
        this.registration = data.registration || { status: 'NEW', level: 'Guest' };
    }

    canSignUp() {
        return this.login.status === 'VERIFIED' && this.registration.status === 'REGISTERED' && this.registration.level !== 'Guest';
    }
}
