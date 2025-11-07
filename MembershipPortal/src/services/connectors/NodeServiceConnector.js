import { ServiceConnector } from './ServiceConnector.js';

export class NodeServiceConnector extends ServiceConnector {
  constructor(options = {}) {
    super();
    this.baseURL = options.baseURL || '/api';
    this.fetchImpl = options.fetch || fetch;
    this.origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
  }

  getDeploymentEnvironment() {
    return (typeof window === 'undefined') ? 'node' : 'web';
  }

  async invoke(fnName, ...args) {
    switch (fnName) {
      case 'getEventList': {
        const [opts] = args;
        const pageSize = opts?.pageSize || 100;
        const page = opts?.currentPage || 1;
        const url = new URL(`${this.baseURL}/events`, this.origin || 'http://localhost');
        url.searchParams.set('pageSize', String(pageSize));
        url.searchParams.set('page', String(page));
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
      case 'getEventAttendees': {
        // Prefer a direct endpoint if available; fallback handled in EventService.
        const [eventId] = args;
        const url = `${this.baseURL}/events/${encodeURIComponent(eventId)}/attendees`;
        return this.getJSON(url);
      }
      case 'getMembersFromContacts': {
        // Demo/test fallback. Replace with your API if available.
        const [contacts] = args;
        return contacts;
      }
      case 'getEventItemList': {
        const [opts] = args;
        const pageSize = opts?.pageSize || 100;
        const url = new URL(`${this.baseURL}/event-items`, this.origin || window.location.origin);
        url.searchParams.set('pageSize', String(pageSize));
        return this.getJSON(url.toString());
      }
      case 'getEventRooms': {
        return this.getJSON(`${this.baseURL}/rooms`);
      }
      case 'getEventHosts':
      case 'getHosts': {
        // Adjust if your API differs
        return this.getJSON(`${this.baseURL}/hosts`);
      }

      case 'getMemberList': {
        const [opts] = args;
        const url = new URL(`${this.baseURL}/members`, this.origin || window.location.origin);
        if (opts?.role) url.searchParams.set('role', String(opts.role));
        if (opts?.minLevel) url.searchParams.set('minLevel', String(opts.minLevel));
        if (opts?.pageSize) url.searchParams.set('pageSize', String(opts.pageSize));
        return this.getJSON(url.toString());
      }

      case 'getMembers': {
        const [opts] = args;
        const url = new URL(`${this.baseURL}/members`, this.origin || window.location.origin);
        if (opts?.minLevel) url.searchParams.set('minLevel', String(opts.minLevel));
        if (opts?.pageSize) url.searchParams.set('pageSize', String(opts.pageSize));
        return this.getJSON(url.toString());
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