import { Logger } from './Logger.js';
import { MemberPortal } from './MemberPortal.js';
import { AdminPortal } from './AdminPortal.js';
import { EventPortal } from './EventPortal.js';
import { PortalSession } from './PortalSession.js';
import { Member } from './model/Member.js';
import { hideSpinner, showSpinner } from './common.js';
/**
 * Manages different portals within the application.
 */
export class PortalManager {
    constructor() {


    }

    static instance = null;
    static start() {
        const manager = new PortalManager();
        manager.initialize();
        PortalManager.instance = manager;
    }
    initialize() {

        showSpinner();
        const params = JSON.parse(document.getElementById('params').textContent);
        // get the config from the service worker using the Google App Script call getConfig()
        google.script.run.withSuccessHandler(config => {
            window.logger = new Logger(config.logLevel || 'INFO');
            Logger.log("Initializing Portal Manager");
            Logger.log(`Parameters: ${document.getElementById('params').textContent}`);

            window.sharedConfig = config;
            document.getElementById('version').textContent = `Version: ${config.version}\nService Version: ${config.membershipVersion}`;
            console.log("Config loaded:", config);
            // Initialize the PortalSession
            const session = new PortalSession(config);
            session.view = params.view || 'event';
            session.viewMode = params.viewMode || 'list';
            this.session = session;
            Logger.log("Portal Session initialized");
            this.portals = {
                member: new MemberPortal(session),
                admin: new AdminPortal(session),
                event: new EventPortal(session)
            };

            Logger.log(`Selected view: ${params.view}`);
            this.routeTo(params.view);
            hideSpinner();
            Logger.log("Portal Manager initialized");
        }).getConfig();
    }

    hidePortals() {
        Object.values(this.portals).forEach(portal => portal.close());
    }

    setPortal(portal) {
        if (this.currentPortal) {
            this.currentPortal.close();
        }
        this.currentPortal = portal;
        this.currentPortal.open().initialize();
    }

    routeTo(view, params = {}) {
        this.session.view = view;
        this.session.params = params;
        if (this.portals[view]) {
            this.setPortal(this.portals[view]);
        } else {
            console.error(`No portal found for view: ${view}`);
        }
    }
}