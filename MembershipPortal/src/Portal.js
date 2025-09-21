/**
 * Interface for a Portal.
 */
import { Component } from './Component.js';
/**
 * Base class for different portals eg: member, admin, event, etc.
 */
export class Portal extends Component{
    
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