import { AppService } from './AppService.js';

export class EventService {
  constructor(connector, appService) {
    this.connector = connector;
    this.appService = appService || null;
  }

  listEvents(options = { pageSize: 100 }) {
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventList', options);
      // Return res.data if success wrapper present
      return (res && res.success && 'data' in res) ? res.data : res;
    });
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

  async getEventAttendees(eventId) {
    if (!eventId) throw new Error('getEventAttendees requires eventId');
    return this.appService.withSpinner(async () => {
      try {
        const direct = await this.connector.invoke('getEventAttendees', eventId);
        const arr = (direct && direct.success && Array.isArray(direct.data)) ? direct.data : (Array.isArray(direct) ? direct : null);
        if (arr) return arr;
      } catch {}
      const event = await this.connector.invoke('getEventById', eventId);
      const evt = (event && event.success && 'data' in event) ? event.data : event;
      let attendees = evt?.attendees || [];
      if (attendees.length && !attendees[0].id && attendees[0].emailAddress) {
        try {
          const resolved = await this.connector.invoke('getMembersFromContacts', attendees);
          attendees = (resolved && resolved.success && Array.isArray(resolved.data)) ? resolved.data : attendees;
        } catch {}
      }
      return attendees;
    });
  }

  getEventItemList(options = { pageSize: 100 }) {
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventItemList', options);
      return (res && res.success && 'data' in res) ? res.data : res;
    });
  }

  getEventRooms() {
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventRooms');
      return (res && res.success && 'data' in res) ? res.data : res;
    });
  }

  async getEventHosts() {
    const raw = await this.connector.invoke('getInstructors');
    const obj = (raw && raw.success && 'data' in raw) ? raw.data : raw;
    const list = Array.isArray(obj) ? obj
      : (Array.isArray(obj?.data) ? obj.data
      : (Array.isArray(obj?.rows) ? obj.rows
      : (Array.isArray(obj?.list) ? obj.list : [])));
    return list.map(h => {
      const id = h.id || h.memberId || h.contactId || h.emailAddress || h.email || h.name || h.fullName || '';
      const name =
        h.name ||
        h.fullName ||
        [h.firstName, h.lastName].filter(Boolean).join(' ') ||
        h.emailAddress ||
        String(id);
      const emailAddress = h.emailAddress || h.email || '';
      return { id: String(id), name, emailAddress };
    }).filter(h => !!h.id);
  }
}
