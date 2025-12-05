// Import modules so Vite/Rollup bundles them (ESM gets stripped)

import { Entity } from './models/Entity.js';
import { Contact } from './models/Contact.js';
// import './models/Member.js';
// import './models/Event.js';
// import './models/Page.js';

// import './services/EventManager.js';
// import './services/MembershipManager.js';
// import './storage/google/calendar/CalendarManager.js';
// import './storage/zoho/ZohoPage.js';

// Attach to GAS global scope
Object.assign(globalThis, {
  Entity,
  Contact,
});
