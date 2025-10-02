import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/style.css';
import { PortalManager } from './PortalManager.js';
import { EventService } from './services/EventService.js';
import { GoogleServiceConnector } from './services/connectors/GoogleServiceConnector.js';
import { NodeServiceConnector } from './services/connectors/NodeServiceConnector.js';

async function initializeApp() {
  const isGAS = typeof google !== 'undefined' && google?.script?.run;
  const connector = isGAS ? new GoogleServiceConnector() : new NodeServiceConnector({ baseURL: '/api' });
  const eventService = new EventService(connector);

  const portalManager = new PortalManager();
  await portalManager.initialize();

  const app = createApp(App, { portalManager });
  app.use(router);

  // Provide EventService globally (no EventPortal)
  app.provide('eventService', eventService);

  app.mount('#app');
}

initializeApp();