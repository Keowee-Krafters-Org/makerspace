import { reactive, computed } from 'vue';
import { Logger } from '@/Logger.js';
import { PortalSession } from '@/PortalSession.js';
import { getConfig } from '../../../Membership/config.js';



export class AppService {
  constructor() {
    this.config = null;
    this.logger = null;
    this.session = null;
    this.bus = this.createEventBus();

    this.spinner = reactive({ count: 0 });
    this.spinnerVisible = computed(() => this.spinner.count > 0);

    // Bridge bus events to the latch
    this.bus.on('spinner:show', () => this.showSpinner());
    this.bus.on('spinner:hide', () => this.hideSpinner());
  }

  initialize() {
    // If getConfig is async in your project, make this async and await it
    const config = getConfig();
    this.config = config;
    this.logger = new Logger(config.logLevel || 'INFO');

    const session = new PortalSession(config);
    session.view = 'event';
    session.viewMode = 'list';
    this.session = reactive(session);

    this.logger.info('AppService initialized');
    return this;
  }

  createEventBus() {
  const listeners = new Map();
  return {
    on(event, cb) {
      const arr = listeners.get(event) || [];
      arr.push(cb);
      listeners.set(event, arr);
      return () => this.off(event, cb);
    },
    off(event, cb) {
      const arr = listeners.get(event) || [];
      const idx = arr.indexOf(cb);
      if (idx >= 0) arr.splice(idx, 1);
      if (!arr.length) listeners.delete(event);
    },
    emit(event, payload) {
      (listeners.get(event) || []).forEach((cb) => {
        try { cb(payload); } catch (_) {}
      });
    },
  };
}

  showSpinner() {
    this.spinner.count += 1;
  }

  hideSpinner() {
    this.spinner.count = Math.max(0, this.spinner.count - 1);
  }

  async withSpinner(op) {
    this.showSpinner();
    try {
      return await op();
    } finally {
      this.hideSpinner();
    }
  }
}