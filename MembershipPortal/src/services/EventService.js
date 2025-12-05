import { AppService } from './AppService.js';
import { Logger } from '../services/Logger.js';

export class EventService {
  constructor(connector, appService) {
    this.connector = connector;
    this.appService = appService || null;
  }

  // Keep listEvents (paged)
  listEvents(options = { pageSize: 10  }) {
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventList', options);
      return (res && res.success && 'data' in res) ? res.data : res;
    });
  }

  // Retain getAllEvents (alias for listEvents with explicit params)
  getAllEvents(options = { pageSize: 100 }) {
    return this.listEvents(options);
  }

  getEventById(id) {
    if (!id) throw new Error('getEventById requires id');
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventById', id);
      return (res && res.success && 'data' in res) ? res.data : res;
    });
  }

  saveEvent(event) {
    if (!event) throw new Error('saveEvent requires event');
    const payload = event; // connector will stringify for GAS
    const run = async () => {
      return event.id
        ? await this.connector.invoke('updateEvent', payload)
        : await this.connector.invoke('createEvent', payload);
    };
    return this.appService?.withSpinner ? this.appService.withSpinner(run) : run();
  }

  deleteEvent(id) {
    if (!id) throw new Error('deleteEvent requires id');
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('deleteEvent', id);
      return (res && res.success && 'data' in res) ? res.data : res;
    });
  }

  async signup(eventId, memberId) {
    if (!eventId) throw new Error('Missing eventId');
    if (!memberId) throw new Error('Missing memberId');
    return this.appService.withSpinner(async () => {
      const obj = await this.connector.invoke('signup', String(eventId), String(memberId));
      const success = !!obj?.success;
      const defaultMsg = 'You have signed up for the class/event. You will receive an email from KeoweeKrafters Org. with your invoice shortly.';
      const message = success
        ? (obj?.data?.message || obj?.message || defaultMsg)
        : (obj?.error || obj?.message || 'Failed to sign up for the event');
      return { success, message, data: obj?.data || null };
    });
  }

  unregister(eventId, memberId) {
    if (!eventId || !memberId) throw new Error('unregister requires eventId and memberId');
    return this.appService.withSpinner(async () => {
      const obj = await this.connector.invoke('unregister', String(eventId), String(memberId));
      return { success: !!obj?.success, message: obj?.message || obj?.error, data: obj?.data || null };
    });
  }

  // Attendees remain intact
  async getEventAttendees(eventId) {
    if (!eventId) throw new Error('getEventAttendees requires eventId');
    return this.appService.withSpinner(async () => {
      try {
        const direct = await this.connector.invoke('getEventAttendees', eventId);
        const arr = (direct && direct.success && Array.isArray(direct.data)) ? direct.data : (Array.isArray(direct) ? direct : null);
        if (arr) return arr;
      } catch { }
      const event = await this.connector.invoke('getEventById', eventId);
      const evt = (event && event.success && 'data' in event) ? event.data : event;
      let attendees = evt?.attendees || [];
      if (attendees.length && !attendees[0].id && attendees[0].emailAddress) {
        try {
          const resolved = await this.connector.invoke('getMembersFromContacts', attendees);
          attendees = (resolved && resolved.success && Array.isArray(resolved.data)) ? resolved.data : attendees;
        } catch { }
      }
      return attendees;
    });
  }

  // Dropdown list endpoints with parameter support
  getEventItemList(options = { pageSize: 100, pageToken: null, search: '' }) {
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventItemList', options);

      Logger.debug(`getEventItemList response: ${JSON.stringify(res)}`);
      return (res && res.success && 'data' in res) ? res.data : res;
    });
  }

  getEventRooms(options = { pageSize: 100, pageToken: null }) {
    return this.appService.withSpinner(async () => {
      Logger.debug(`getEventRooms response: ${JSON.stringify(options)}`);
      const res = await this.connector.invoke('getEventRooms', options);
      return (res && res.success && 'data' in res) ? res.data : res;
    });
  }

  async getEventHosts(options = { pageSize: 100, pageToken: null, role: 'instructor' }) {
    // Prefer event hosts endpoint if available, otherwise instructors
    const endpoint = 'getInstructors';
    return this.appService.withSpinner(async () => {
      const raw = await this.connector.invoke(endpoint, options);
      Logger.debug(`getEventHosts via ${endpoint} response: ${JSON.stringify(raw)}`);
      const list = (raw && raw.success && 'data' in raw) ? raw.data : raw;
      return list.map(h => {
        const id = h.id ;
        const name =
          h.name ||
          [h.firstName, h.lastName].filter(Boolean).join(' ') || '';
        const emailAddress = h.emailAddress || '';
        return { id: String(id || ''), name, emailAddress };
      }).filter(h => !!h.id);
    });
  }

  // Images (multi-image)
  async getImages(eventId) {
    const res = await this.connector.invoke('getEventImages', eventId);
    return (res && res.success && res.data) ? res.data : [];
  }

  async addImage(eventId, imageMeta) {
    const res = await this.connector.invoke('addEventImage', eventId, imageMeta);
    return (res && res.success && res.data) ? res.data : [];
  }

  async removeImage(eventId, fileId) {
    const res = await this.connector.invoke('removeEventImage', eventId, fileId);
    return (res && res.success && res.data) ? res.data : [];
  }

  async reorderImages(eventId, orderedIds) {
    const res = await this.connector.invoke('reorderEventImages', eventId, orderedIds);
    return (res && res.success && res.data) ? res.data : [];
  }

  // Generic “fetch all pages” helper retained
  async fetchAll(getPageFn, { pageSize = 100 } = {}) {
    const acc = [];
    let pageToken = null;
    /* eslint-disable no-await-in-loop */
    for (; ;) {
      const result = await getPageFn({ pageSize, pageToken });
      const items = result.data || [];
      const page = result.page || null;
      pageToken = page.pageToken || null;
      acc.push(...items);
      if (!pageToken) break;
    }
    return acc;
  }

  // Convenience “All” methods retained
  async getEventItemListAll(opts = {}) {
    return this.fetchAll((p) => this.getEventItemList({ ...opts, ...p }), { pageSize: opts.pageSize || 100 });
  }
  async getEventRoomsAll(opts = {}) {
    return this.fetchAll((p) => this.getEventRooms({ ...opts, ...p }), { pageSize: opts.pageSize || 100 });
  }
  async getEventHostsAll(opts = {}) {
    return this.fetchAll((p) => this.getEventHosts({ ...opts, ...p }), { pageSize: opts.pageSize || 100 });
  }

  // Retain getMembersFromContacts for attendee resolution
  async getMembersFromContacts(contacts, options = {}) {
    const res = await this.connector.invoke('getMembersFromContacts', contacts, options);
    return (res && res.success && 'data' in res) ? res.data : res;
  }
}
