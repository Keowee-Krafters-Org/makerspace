import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/style.css';
import { PortalManager } from './PortalManager.js';

PortalManager.start(); // Start the PortalManager to initialize services

const session = PortalManager.getInstance().getSession(); // Get the initialized session

createApp(App, { session }).use(router).mount('#app'); // Pass the session and use the router