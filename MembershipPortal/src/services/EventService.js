import { AppService } from './AppService.js';

export class EventService {
  constructor(connector, appService) {
    if (!connector) throw new Error('EventService requires a ServiceConnector');
    if (!appService) throw new Error('EventService requires AppService');
    this.connector = connector;
    this.app = appService;
  }

  static normalize(res) {
    return (res && typeof res === 'object' && 'success' in res && 'data' in res) ? res.data : res;
  }

  listEvents(options = { pageSize: 100 }) {
    return this.app.withSpinner(async () => {
      const res = await this.connector.invoke('getEventList', options);
      return EventService.normalize(res);
    });
  }

  getEventById(id) {
    if (!id) throw new Error('getEventById requires id');
    return this.app.withSpinner(async () => {
      const res = await this.connector.invoke('getEventById', id);
      return EventService.normalize(res);
    });
  }

  saveEvent(event) {
    if (!event) throw new Error('saveEvent requires event');
    const isGAS = typeof google !== 'undefined' && google?.script?.run;
    const payload = isGAS ? JSON.stringify(event) : event;

    return this.app.withSpinner(async () => {
      const res = event.id
        ? await this.connector.invoke('updateEvent', payload)
        : await this.connector.invoke('createEvent', payload);
      return EventService.normalize(res);
    });
  }

  deleteEvent(id) {
    if (!id) throw new Error('deleteEvent requires id');
    return this.app.withSpinner(async () => {
      const res = await this.connector.invoke('deleteEvent', id);
      return EventService.normalize(res);
    });
  }

  signup(eventId, memberId) {
    if (!eventId || !memberId) throw new Error('signup requires eventId and memberId');
    return this.app.withSpinner(async () => {
      const res = await this.connector.invoke('signup', eventId, memberId);
      return EventService.normalize(res);
    });
  }

  unregister(eventId, memberId) {
    if (!eventId || !memberId) throw new Error('unregister requires eventId and memberId');
    return this.app.withSpinner(async () => {
      const res = await this.connector.invoke('unregister', eventId, memberId);
      return EventService.normalize(res);
    });
  }

  // Updated: derive attendees from event; resolve contacts when needed.
  async getEventAttendees(eventId) {
    if (!eventId) throw new Error('getEventAttendees requires eventId');
    return this.app.withSpinner(async () => {
      // Try direct API first (for Node/demo), else fall back to event details.
      try {
        const maybe = await this.connector.invoke('getEventAttendees', eventId);
        const direct = EventService.normalize(maybe);
        if (Array.isArray(direct)) return direct;
      } catch (_) {
        // ignore and fall back
      }

      const event = await this.connector.invoke('getEventById', eventId).then(EventService.normalize);
      let attendees = event?.attendees || [];

      // Legacy pattern: attendees are contact refs (no id, but emailAddress)
      if (attendees.length && !attendees[0].id && attendees[0].emailAddress) {
        try {
          const resolved = await this.connector.invoke('getMembersFromContacts', attendees);
          attendees = EventService.normalize(resolved);
        } catch {
          // keep original contacts if resolve not available
        }
      }
      return attendees;
    });
  }

  // New: Editor data
  getEventItemList(options = { pageSize: 100 }) {
    return this.app.withSpinner(async () => {
      const res = await this.connector.invoke('getEventItemList', options);
      return EventService.normalize(res);
    });
  }

  getEventRooms() {
    return this.app.withSpinner(async () => {
      const res = await this.connector.invoke('getEventRooms');
      return EventService.normalize(res);
    });
  }

  // New: Hosts for dropdown (optional on GAS, handled gracefully in UI)
  async getEventHosts() {
    // Try several backends/endpoints; return [] if none available.
    return this.app.withSpinner(async () => {
      const tryInvoke = async (fn, arg) => {
        try {
          const res = await this.connector.invoke(fn, arg);
          const data = EventService.normalize(res);
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.data)) return data.data;
        } catch (e) {
          // noop
        }
        return null;
      };

      // Primary
      let hosts = await tryInvoke('getEventHosts');
      if (!hosts) hosts = await tryInvoke('getHosts');
      // Fallback: member list filtered to host role/level
      if (!hosts) hosts = await tryInvoke('getMemberList', { role: 'HOST', pageSize: 500 });
      if (!hosts) hosts = await tryInvoke('getMembers', { minLevel: 'HOST', pageSize: 500 });

      return hosts || [];
    });
  }
}
