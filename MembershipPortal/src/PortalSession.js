/**
 * Manages the session for a specific portal.
 */
import { Member } from './model/Member.js';
export class PortalSession {
    constructor(config = {}) {
        this.view = 'event'; // default view
        this.viewMode = 'list'; // default view mode
        this.config = config;
        this.member = new Member(
            {
                id: '', firstName: 'Guest',
                lastName: 'Member',
                email: '',
                registration: {
                    level: 'Guest',
                    status: 'NEW'
                },
                login: {
                    status: 'UNVERIFIED'
                }
            }
        );
        this.params = {};
    }
}
