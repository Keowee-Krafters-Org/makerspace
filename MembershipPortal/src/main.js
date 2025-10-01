import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/style.css';
import { PortalManager } from './PortalManager.js';

async function initializeApp() {

  // Create and mount the Vue app
  createApp(App ).use(router).mount('#app');
}

// Initialize the app
initializeApp();