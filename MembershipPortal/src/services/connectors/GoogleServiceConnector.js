import { ServiceConnector } from './ServiceConnector.js';

export class GoogleServiceConnector extends ServiceConnector {
  getDeploymentEnvironment() {
    return 'gas';
  }

  invoke(fnName, ...args) {
    return new Promise((resolve, reject) => {
      const run = (typeof google !== 'undefined' && google?.script?.run) ? google.script.run : null;
      if (!run) return reject(new Error('Google Apps Script runtime not available'));

      const onFailure = (e) => {
        const msg = typeof e === 'string' ? e : (e?.message || 'Apps Script error');
        reject(new Error(`GAS call '${fnName}' failed: ${msg}`));
      };

      const onSuccess = (res) => {
        if (typeof res === 'string') {
          const s = res.trim();
          if (s.startsWith('{') || s.startsWith('[')) {
            try {
              resolve(JSON.parse(s));
              return;
            } catch {
              // fall through to resolve raw string
            }
          }
        }
        resolve(res);
      };

      const runner = run.withSuccessHandler(onSuccess).withFailureHandler(onFailure);
      const serverFn = runner?.[fnName];
      if (typeof serverFn !== 'function') {
        reject(new Error(`GAS server function '${fnName}' not found or not exposed`));
        return;
      }
      serverFn(...args);
    });
  }
}