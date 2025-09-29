import { Logger } from './Logger.js';
import { MemberPortal } from './MemberPortal.js';
import { AdminPortal } from './AdminPortal.js';
import { EventPortal } from './EventPortal.js';
import { PortalSession } from './PortalSession.js';
import { showSpinner, hideSpinner } from './common.js';
/**
 * Manages different portals within the application.
 */
export class PortalManager {
    constructor() {
        this.portals = {};
        this.session = null;
    }

    static instance = null;
    static start() {
        const manager = new PortalManager();
        manager.initialize();
        PortalManager.instance = manager;
    }

    static getInstance() {
        if (!PortalManager.instance) {
            PortalManager.instance = new PortalManager();
        }
        return PortalManager.instance;
    }

    initialize() {

        showSpinner();
        const paramsElement = document.getElementById('params');
        if (!paramsElement) {
            // Not running in Google Apps Script environment
            // Use default parameters or handle accordingly

            Logger.log("Params element not found");
            hideSpinner();
            return this.start();
        }
        const params = JSON.parse(paramsElement.textContent);
        // Fetch the configuration from the backend
        google.script.run.withSuccessHandler(config => {
            window.logger = new Logger(config.logLevel || 'INFO');
            Logger.log("Initializing Portal Manager");
            Logger.log(`Parameters: ${JSON.stringify(params)}`);

            window.sharedConfig = config;
            document.getElementById('version').textContent = `Version: ${config.version}\nService Version: ${config.membershipVersion}`;
            this.start(config);
            Logger.log("Portal Manager initialized with config:", config);
           
            hideSpinner();
        }).getConfig();
    }

    /**
     * Get the current session.
     * Initialize service classes and return the session.
     * @returns {PortalSession} The initialized session object.
     */
    start(config, params = {}) {
         // Initialize the PortalSession
            const session = new PortalSession(config);
            session.view = params?.view || 'member';
            session.viewMode = params?.viewMode || 'list';
            this.session = session;

            Logger.log("Portal Session initialized");

            // Initialize service classes
            this.portals = {
                member: new MemberPortal(session),
                admin: new AdminPortal(session),
                event: new EventPortal(session)
            };

            Logger.log("Portal Manager initialized");
        return this.session;
    }
    getSession() {
        return this.session;
    }

    getPortal(portalName) {
        return this.portals[portalName];
    }
}