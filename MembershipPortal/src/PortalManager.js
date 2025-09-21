import { Logger } from './Logger.js';
import { MemberPortal } from './MemberPortal.js';
import { AdminPortal } from './AdminPortal.js';
import { EventPortal } from './EventPortal.js';
import { PortalSession } from './PortalSession.js';
import { Member } from './model/Member.js';
/**
 * Manages different portals within the application.
 */
export class PortalManager {
    constructor() {


    }

    static  instance = null;
    static start() {
        const manager = new PortalManager();
        manager.initialize();
        PortalManager.instance = manager;
    }
    initialize() {
        Logger.log("Initializing Portal Manager");
        Logger.log(`Parameters: ${document.getElementById('params').textContent}`);
        const params = JSON.parse(document.getElementById('params').textContent);
        // get the config from the service worker using the Google App Script call getConfig()
        google.script.run.withSuccessHandler(config => {
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
            window.memberPortal = this.portals; // Expose the instance globally
            this.setPortal(this.portals[params.view]);
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
        this.currentPortal.initialize().open();
    }

    routeTo(view,params = {}) {
        this.session.view = view;
        this.session.params = params;
        if (this.portals[view]) {
            this.setPortal(this.portals[view]);
        } else {
            console.error(`No portal found for view: ${view}`);
        }
    }
}