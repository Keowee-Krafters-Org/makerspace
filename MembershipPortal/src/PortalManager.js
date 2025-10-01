import { Logger } from './Logger.js';
import { MemberPortal } from './MemberPortal.js';
import { AdminPortal } from './AdminPortal.js';
import { EventPortal } from './EventPortal.js';
import { PortalSession } from './PortalSession.js';
import { showSpinner, hideSpinner } from './common.js';
import { getConfig } from '../../Membership/config.js';
/**
 * Manages different portals within the application.
 */
export class PortalManager {
    constructor() {
        this.portals = {};
        this.session = null;
        this.logger = null; 
    }

 
     initialize() {
        const config =  getConfig(); // Ensure getConfig() is asynchronous if needed
        this.logger = new Logger(config.logLevel || 'INFO');
        const logger = this.logger; // Local reference for convenience
        logger.info("Initializing PortalManager...");
        logger.debug("PortalManager initialized with config:", JSON.stringify(config));

        // Initialize session based on URL parameters
        const session = new PortalSession(config);
        session.view = 'event';
        session.viewMode = 'list';
        this.session = session;

        this.portals = {
            member: new MemberPortal(session),
            admin: new AdminPortal(session),
            event: new EventPortal(session),
        };
        return this;
    }

    getSession() {
        return this.session;
    }
}