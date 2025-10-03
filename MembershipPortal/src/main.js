import { createApp } from 'vue';
import App from './App.vue';
import './styles/style.css';

import { AppService } from './services/AppService.js';
import { EventService } from './services/EventService.js';
import { MemberService } from './services/MemberService.js';
import { GoogleServiceConnector } from './services/connectors/GoogleServiceConnector.js';
import { NodeServiceConnector } from './services/connectors/NodeServiceConnector.js';
import { createRouter } from './router.js';

async function initializeApp() {
  const isGAS = typeof google !== 'undefined' && google?.script?.run;
  const connector = isGAS ? new GoogleServiceConnector() : new NodeServiceConnector({ baseURL: '/api' });

  // Read GAS-injected JSON first; otherwise use URL params
  const readInjected = (id) => {
    try {
      const el = document.getElementById(id);
      const txt = el?.textContent?.trim();
      return txt ? JSON.parse(txt) : null;
    } catch { return null; }
  };
  const url = new URL(window.location.href);
  const view = (readInjected('view') ?? url.searchParams.get('view') ?? 'event').toString().toLowerCase();
  const viewMode = (readInjected('view-mode') ?? url.searchParams.get('viewMode') ?? 'list').toString().toLowerCase();

  const appService = new AppService().initialize();
  appService.session.view = view;
  appService.session.viewMode = viewMode;

  const eventService = new EventService(connector, appService);
  const memberService = new MemberService(connector, appService);

  const app = createApp(App);
  const router = createRouter(appService.session);

  app.use(router);
  app.provide('appService', appService);
  app.provide('logger', appService.logger);
  app.provide('session', appService.session);
  app.provide('bus', appService.bus);
  app.provide('eventService', eventService);
  app.provide('memberService', memberService);

  app.mount('#app');
}

initializeApp();