import { Logger } from '@makerspace/membership-common';
import { config } from '../config.js';

export class EventService {
  constructor() {
    this.logger = new Logger(config.logLevel || 'INFO');
  }

  _normalizeResponse(response) {
    let normalized = response;

    if (typeof normalized === 'string') {
      try {
        normalized = JSON.parse(normalized);
      } catch (e) {
        this.logger.warn('Failed to parse events response JSON:', e);
      }
    }

    return normalized;
  }

  _run(func, ...args) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [func](...args);
    });
  }

  getEvents() {
    return this._run('getEvents')
      .then(rawResponse => {
        const response = this._normalizeResponse(rawResponse);
        this.logger.debug('Events response:', response);
        if (!response || typeof response !== 'object') {
          return { data: [] };
        }
        if (response.error) {
          throw new Error(response.error);
        }
        if (Array.isArray(response)) {
          return { data: response };
        }
        if (!Array.isArray(response.data)) {
          return { ...response, data: [] };
        }
        return response;
      })
      .catch(error => {
        this.logger.error('Error fetching events:', error);
        return { error: error && error.message ? error.message : String(error), data: [] };
      });
  }
}

