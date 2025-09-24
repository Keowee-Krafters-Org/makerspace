/**
 * Interface for a Portal.
 */
import { Container } from './Container.js';
/**
 * Base class for different portals eg: member, admin, event, etc.
 */
export class Portal extends Container{
    
    constructor(session, divId = 'defaultDiv', name = 'Portal') {
        super(divId);
        this.session = session;
        this.config = session.config;
        this.name = name;
        this.initialized = false;
    }
    /**
     * Initialize the portal.
     */
        initialize() {
            super.initialize();
        return this; 
    }

}