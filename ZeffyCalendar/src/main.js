import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';
import { Logger } from '@makerspace/membership-common';
import { config } from './config.js';
import { EventService } from './services/EventService.js';

new Logger(config.logLevel);

const app = createApp(App);

app.provide('eventService', new EventService());

app.use(router);

app.mount('#app');