import { ServiceConnector } from './ServiceConnector.js';

export class GoogleServiceConnector extends ServiceConnector {
  invoke(fnName, ...args) {
    return new Promise((resolve, reject) => {
      const run = (typeof google !== 'undefined' && google?.script?.run) ? google.script.run : null;
      if (!run) return reject(new Error('Google Apps Script runtime not available'));

      const onFailure = (e) => reject(typeof e === 'string' ? new Error(e) : e);
      const onSuccess = (res) => {
        try {
          resolve(typeof res === 'string' ? JSON.parse(res) : res);
        } catch {
          resolve(res);
        }
      };

      // Important: call the function on the runner returned by with* handlers
      const runner = run.withFailureHandler(onFailure).withSuccessHandler(onSuccess);
      const serverFn = runner[fnName];
      if (typeof serverFn !== 'function') {
        reject(new Error(`GAS server function '${fnName}' not found or not exposed`));
        return;
      }
      serverFn(...args);
    });
  }
}