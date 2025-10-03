import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/style.css';

import { AppService } from './services/AppService.js';
import { EventService } from './services/EventService.js';
import { MemberService } from './services/MemberService.js';
import { GoogleServiceConnector } from './services/connectors/GoogleServiceConnector.js';
import { NodeServiceConnector } from './services/connectors/NodeServiceConnector.js';

async function initializeApp() {
  const isGAS = typeof google !== 'undefined' && google?.script?.run;
  const connector = isGAS ? new GoogleServiceConnector() : new NodeServiceConnector({ baseURL: '/api' });

  const appService = new AppService().initialize();
  const eventService = new EventService(connector, appService);
  const memberService = new MemberService(connector, appService);

  const app = createApp(App);
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