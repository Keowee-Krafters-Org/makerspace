import { ServiceConnector } from './ServiceConnector.js';

export class GoogleServiceConnector extends ServiceConnector {
  getDeploymentEnvironment() {
    return 'gas';
  }

  // Serialize complex args for GAS (server expects JSON strings for objects)
  serializeArgForGAS_(arg) {
    if (arg == null) return arg;
    const t = typeof arg;
    if (t === 'string' || t === 'number' || t === 'boolean') return arg;
    if (arg instanceof Date) return arg.toISOString();
    if (typeof Blob !== 'undefined' && arg instanceof Blob) return arg;
    if (typeof File !== 'undefined' && arg instanceof File) return arg;
    try {
      return JSON.stringify(arg);
    } catch {
      try { return JSON.stringify({ value: String(arg) }); } catch { return String(arg); }
    }
  }

  normalizeResponse_(res) {
    // Parse top-level string
    let r = res;
    if (typeof r === 'string') {
      try { r = JSON.parse(r); } catch {}
    }
    // Handle double-encoded
    if (typeof r === 'string') {
      try { r = JSON.parse(r); } catch {}
    }
    // Unwrap { success, data: "<json>" }
    if (r && typeof r === 'object' && typeof r.data === 'string') {
      try {
        const dataObj = JSON.parse(r.data);
        // If dataObj itself has success/data, keep outer success, replace data
        r.data = dataObj;
      } catch {}
    }
    return r;
  }

  invoke(fnName, ...args) {
    return new Promise((resolve, reject) => {
      if (!(typeof google !== 'undefined' && google?.script?.run)) {
        reject(new Error('google.script.run not available'));
        return;
      }
      const cooked = args.map(a => this.serializeArgForGAS_(a));
      const runner = google.script.run
        .withSuccessHandler((res) => resolve(this.normalizeResponse_(res)))
        .withFailureHandler((err) => reject(err));

      if (typeof runner[fnName] !== 'function') {
        reject(new Error(`GAS server function '${fnName}' not found or not exposed`));
        return;
      }
      runner[fnName].apply(runner, cooked);
    });
  }
}