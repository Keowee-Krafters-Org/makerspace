import { Logger } from '@makerspace/membership-common';
import { config } from '../config.js';

export class EventService {
  constructor() {
    this.logger = new Logger(config.logLevel || 'INFO');
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
      .then(response => {
        this.logger.debug('Events response:', response);
        if (response.error) {
          throw new Error(response.error);
        }
        return response;
      })
      .catch(error => {
        this.logger.error('Error fetching events:', error);
        return [];
      });
  }
}

