import { reactive } from 'vue';
export class EventService {
  constructor(connector) {
    if (!connector) throw new Error('EventService requires a ServiceConnector');
    this.connector = connector;
  }

  // Utility: unwrap { success, data } envelopes if present
  static normalize(res) {
    return (res && typeof res === 'object' && 'success' in res && 'data' in res) ? res.data : res;
  }

  // GAS: getEventList({ pageSize: 100 })
  async listEvents(options = { pageSize: 100 }) {
    const res = await this.connector.invoke('getEventList', options);
    return EventService.normalize(res);
  }

  async getEventById(id) {
    if (!id) throw new Error('getEventById requires id');
    const res = await this.connector.invoke('getEventById', id);
    return EventService.normalize(res);
  }

  // Chooses create vs update; stringify only if GAS expects strings
  async saveEvent(event) {
    if (!event) throw new Error('saveEvent requires event');
    const isGAS = typeof google !== 'undefined' && google?.script?.run;
    const payload = isGAS ? JSON.stringify(event) : event;

    if (event.id) {
      const res = await this.connector.invoke('updateEvent', payload);
      return EventService.normalize(res);
    } else {
      const res = await this.connector.invoke('createEvent', payload);
      return EventService.normalize(res);
    }
  }

  async deleteEvent(id) {
    if (!id) throw new Error('deleteEvent requires id');
    const res = await this.connector.invoke('deleteEvent', id);
    return EventService.normalize(res);
  }

  async signup(eventId, memberId) {
    if (!eventId || !memberId) throw new Error('signup requires eventId and memberId');
    const res = await this.connector.invoke('signup', eventId, memberId);
    return EventService.normalize(res);
  }

  async unregister(eventId, memberId) {
    if (!eventId || !memberId) throw new Error('unregister requires eventId and memberId');
    const res = await this.connector.invoke('unregister', eventId, memberId);
    return EventService.normalize(res);
  }
}
