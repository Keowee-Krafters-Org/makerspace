import { ServiceConnector } from './ServiceConnector.js';

export class NodeServiceConnector extends ServiceConnector {
  constructor(options = {}) {
    super();
    this.baseURL = options.baseURL || '/api';
    this.fetchImpl = options.fetch || fetch;
  }

  async invoke(fnName, ...args) {
    switch (fnName) {
      case 'getEventList': {
        const [opts] = args;
        const pageSize = opts?.pageSize || 100;
        const url = new URL(`${this.baseURL}/events`, window.location.origin);
        url.searchParams.set('pageSize', String(pageSize));
        return this.getJSON(url.toString());
      }
      case 'getEventById': {
        const [id] = args;
        return this.getJSON(`${this.baseURL}/events/${encodeURIComponent(id)}`);
      }
      case 'createEvent': {
        const [payload] = args;
        const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
        return this.sendJSON(`${this.baseURL}/events`, 'POST', body);
      }
      case 'updateEvent': {
        const [payload] = args;
        const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const id = body?.id;
        if (!id) throw new Error('updateEvent requires event with id');
        return this.sendJSON(`${this.baseURL}/events/${encodeURIComponent(id)}`, 'PUT', body);
      }
      case 'deleteEvent': {
        const [id] = args;
        return this.delete(`${this.baseURL}/events/${encodeURIComponent(id)}`);
      }
      case 'signup': {
        const [eventId, memberId] = args;
        return this.sendJSON(`${this.baseURL}/events/${encodeURIComponent(eventId)}/signup`, 'POST', { memberId });
      }
      case 'unregister': {
        const [eventId, memberId] = args;
        return this.sendJSON(`${this.baseURL}/events/${encodeURIComponent(eventId)}/unregister`, 'POST', { memberId });
      }
      default:
        throw new Error(`Unknown API function: ${fnName}`);
    }
  }

  async getJSON(url) {
    const res = await this.fetchImpl(url);
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return res.json();
  }

  async sendJSON(url, method, body) {
    const res = await this.fetchImpl(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${method} ${url} failed: ${res.status}`);
    return res.json();
  }

  async delete(url) {
    const res = await this.fetchImpl(url, { method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
    try {
      return await res.json();
    } catch {
      return true;
    }
  }
}