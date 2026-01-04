import { AppService } from './AppService.js';
import { Logger } from '../services/Logger.js';
import { LookupCache } from './LookupCache.js';

export class EventService {
  constructor(connector, appService) {
    this.connector = connector;
    this.appService = appService || null;
    // Use shared AppService cache if present; else create local cache
    this.cache = (this.appService && this.appService.cache) || new LookupCache({ ttlMs: 5 * 60 * 1000 });
  }

  // Keep listEvents (paged) - expects options.page
  listEvents(options = { page: { pageSize: 10 } }) {
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventList', options);
      return (res && res.success && 'data' in res) ? res.data : res;
    });
  }

  // Retain getAllEvents (alias for listEvents with explicit page)
  getAllEvents(options = { page: { pageSize: 100 } }) {
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

  // Dropdown list endpoints with Page parameter
  getEventItemList(options = { page: { pageSize: 100 }, search: '' , cache: true }) {
    const useCache = options?.cache !== false && !options?.search; // avoid caching search-filtered results
    const fetchFn = async () => {
      const responseString = await this.connector.invoke('getEventItemList', options);
      const response = (responseString && typeof responseString === 'string') ? JSON.parse(responseString) : responseString;
      Logger.debug(`getEventItemList received: ${JSON.stringify(response)}`);
      return response;
    };
    return this.appService.withSpinner(async () => {
      return useCache
        ? await this.cache.fetchOrGet('eventItems', fetchFn)
        : await fetchFn();
    });
  }

  getEventRooms(options = { page: { pageSize: 100 }, cache: true }) {
    const useCache = options?.cache !== false;
    const fetchFn = async () => {
      const responseString = await this.connector.invoke('getEventRooms', options);
      const response = (responseString && typeof responseString === 'string') ? JSON.parse(responseString) : responseString;
      Logger.debug(`getEventRooms received: ${JSON.stringify(response)}`);
      return response;
    };
    return this.appService.withSpinner(async () => {
      return useCache
        ? await this.cache.fetchOrGet('rooms', fetchFn)
        : await fetchFn();
    });
  }

  async getEventHosts(options = { page: { pageSize: 100 }, role: 'instructor', cache: true }) {
    const endpoint = 'getEventHosts';
    const useCache = options?.cache !== false && !options?.search && !options?.role; // avoid caching filtered role/search variants
    const fetchFn = async () => {
      const responseString = await this.connector.invoke(endpoint, options);
      const response = (responseString && typeof responseString === 'string') ? JSON.parse(responseString) : responseString;
      response.data = (response && response.success && Array.isArray(response.data)) ? response.data : [].map((member) =>
         ({ id: member.id, name: `${member.firstName} ${member.lastName}` }));
      Logger.debug(`getEventHosts received: ${JSON.stringify(response)}`);
      return response;
    };
    return this.appService.withSpinner(async () => {
      return useCache
        ? await this.cache.fetchOrGet('hosts', fetchFn)
        : await fetchFn();
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

  // Generic “fetch all pages” helper using Page exclusively
  async fetchAll(getPageFn, { pageSize = 100 } = {}) {
    const acc = [];
    let page = { pageSize, currentPageMarker: '1', pageToken: null };
    /* eslint-disable no-await-in-loop */
    for (; ;) {
      const result = await getPageFn({ page }); // pass Page object
      Logger.debug(`fetchAll received page: ${JSON.stringify(result?.page)}`);
      const items = result?.data || [];
      const respPage = result?.page || null;
      acc.push(...items);

      const nextMarker = respPage?.nextPageMarker ?? respPage?.pageToken ?? null;
      if (!nextMarker) break;

      // advance Page
      page = { ...page, currentPageMarker: nextMarker, pageToken: nextMarker };
    }
    return acc;
  }

  // Convenience “All” methods now accept Page
  async getEventItemListAll(opts = {}) {
    const pageSize = opts.page?.pageSize ?? 100;
    const res = await this.fetchAll((p) => this.getEventItemList({ ...opts, ...p, cache: false }), { pageSize });
    // refresh cache with full list
    this.cache.set('eventItems', { success: true, data: res, page: { pageSize, currentPageMarker: 'ALL' } });
    return res;
  }
  async getEventRoomsAll(opts = {}) {
    const pageSize = opts.page?.pageSize ?? 100;
    const res = await this.fetchAll((p) => this.getEventRooms({ ...opts, ...p, cache: false }), { pageSize });
    this.cache.set('rooms', { success: true, data: res, page: { pageSize, currentPageMarker: 'ALL' } });
    return res;
  }
  async getEventHostsAll(opts = {}) {
    const pageSize = opts.page?.pageSize ?? 100;
    const res = await this.fetchAll((p) => this.getEventHosts({ ...opts, ...p, cache: false }), { pageSize });
    this.cache.set('hosts', { success: true, data: res, page: { pageSize, currentPageMarker: 'ALL' } });
    return res;
  }

  // Retain getMembersFromContacts for attendee resolution
  async getMembersFromContacts(contacts, options = {}) {
    const res = await this.connector.invoke('getMembersFromContacts', contacts, options);
    return (res && res.success && 'data' in res) ? res.data : res;
  }
}
