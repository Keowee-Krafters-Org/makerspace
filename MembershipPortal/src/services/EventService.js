import { AppService } from './AppService.js';

export class EventService {
  constructor(connector, appService) {
    this.connector = connector;
    this.appService = appService || null;
  }

  static normalize(res) {
    return (res && typeof res === 'object' && 'success' in res && 'data' in res) ? res.data : res;
  }

  listEvents(options = { pageSize: 100 }) {
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventList', options);
      return EventService.normalize(res);
    });
  }

  getEventById(id) {
    if (!id) throw new Error('getEventById requires id');
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventById', id);
      return EventService.normalize(res);
    });
  }

  saveEvent(event) {
    if (!event) throw new Error('saveEvent requires event');
    const payload = JSON.stringify(event); // GAS needs JSON for nested objects (image.data)

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
      return EventService.normalize(res);
    });
  }

  async signup(eventId, memberId) {
    if (!eventId) throw new Error('Missing eventId');
    if (!memberId) throw new Error('Missing memberId');

    return this.appService.withSpinner(async () => {
      const raw = await this.connector.invoke('signup', String(eventId), String(memberId));
      const obj = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
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
      const res = await this.connector.invoke('unregister', String(eventId), String(memberId));
      const obj = typeof res === 'string' ? JSON.parse(res) : (res || {});
      return { success: !!obj?.success, message: obj?.message || obj?.error, data: obj?.data || null };
    });
  }

  // Updated: derive attendees from event; resolve contacts when needed.
  async getEventAttendees(eventId) {
    if (!eventId) throw new Error('getEventAttendees requires eventId');
    return this.appService.withSpinner(async () => {
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
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventItemList', options);
      return EventService.normalize(res);
    });
  }

  getEventRooms() {
    return this.appService.withSpinner(async () => {
      const res = await this.connector.invoke('getEventRooms');
      return EventService.normalize(res);
    });
  }

  // New: Hosts for dropdown (optional on GAS, handled gracefully in UI)
  async getEventHosts() {
    // Calls GAS getInstructors and normalizes the result
    const raw = await this.connector.invoke('getInstructors');
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const list = Array.isArray(obj) ? obj
      : (Array.isArray(obj?.data) ? obj.data
      : (Array.isArray(obj?.rows) ? obj.rows
      : (Array.isArray(obj?.list) ? obj.list : [])));

    // Normalize to { id, name, emailAddress }
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
