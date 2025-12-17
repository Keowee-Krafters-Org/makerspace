/**
 * CalendarEvent.js
 * Represents a calendar event with additional properties for event items.
 * Extends the base Event class to include event item details.
 */
class CalendarEvent extends Event {
  constructor(eventData = {}) {
    if (!eventData.eventItem) {
      eventData.eventItem = {};
    }
    super(eventData);
    // capture recurring series id when provided
    this.seriesId = eventData.seriesId || eventData.recurringEventId || eventData.id || null;
  }

  get description() {
    return this.eventItem.description || '';
  }
  set description(value) {
    this.eventItem.description = value;
  }
  get title() {
    // Avoid self-recursion; rely on eventItem.title
    return this.eventItem.title || '';
  }
  set title(value) {
    this.eventItem.title = value;
  }
  get price() {
    return this.eventItem.price || 0;
  }
  set price(value) {
    this.eventItem.price = value;
  }
  get cost() {
    return this.eventItem.cost || 0;
  }
  set cost(value) {
    this.eventItem.cost = value;
  }
  get costDescription() {
    return this.eventItem.costDescription || '';
  }
  set costDescription(value) {
    this.eventItem.costDescription = value;
  }

   // Convert simplified recurrence into Calendar API RRULE array
  static normalizeRecurrenceToApi(recur, start) {
    if (!recur) return undefined;

    // Already RRULE array
    if (Array.isArray(recur) && recur.every(x => typeof x === 'string' && x.toUpperCase().startsWith('RRULE'))) {
      return recur.slice();
    }

    // If it's a single RRULE string
    if (typeof recur === 'string' && recur.toUpperCase().startsWith('RRULE')) {
      return [recur];
    }

    // Map day names/numbers to BYDAY codes
    const dayMap = {
      0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA',
      su: 'SU', sun: 'SU', sunday: 'SU',
      mo: 'MO', mon: 'MO', monday: 'MO',
      tu: 'TU', tue: 'TU', tuesday: 'TU',
      we: 'WE', wed: 'WE', wednesday: 'WE',
      th: 'TH', thu: 'TH', thursday: 'TH',
      fr: 'FR', fri: 'FR', friday: 'FR',
      sa: 'SA', sat: 'SA', saturday: 'SA',
    };
    const toByDay = (v) => {
      const arr = Array.isArray(v) ? v : String(v).split(',').map(s => s.trim());
      const codes = arr.map(x => {
        if (typeof x === 'number') return dayMap[x] || null;
        const key = String(x).toLowerCase();
        return dayMap[key] || (key.length === 2 ? key.toUpperCase() : null);
      }).filter(Boolean);
      return codes.length ? codes.join(',') : undefined;
    };
    const toUtcUntil = (v, s) => {
      // UNTIL must be in UTC as YYYYMMDDTHHmmssZ (use start's time for all-day clarity if available)
      const d = v ? (v instanceof Date ? new Date(v) : new Date(String(v))) : null;
      if (!d) return undefined;
      const allDay = !!(s && typeof s === 'object' && !(s instanceof Date) && s.date && !s.dateTime);
      const base = (d instanceof Date) ? d : new Date(d);
      // If all-day, strip time to 00:00:00
      const t = new Date(base.getTime());
      if (allDay) {
        t.setUTCHours(0, 0, 0, 0);
      }
      const pad = (n) => String(n).padStart(2, '0');
      const yyyy = t.getUTCFullYear();
      const mm = pad(t.getUTCMonth() + 1);
      const dd = pad(t.getUTCDate());
      const HH = pad(t.getUTCHours());
      const MM = pad(t.getUTCMinutes());
      const SS = pad(t.getUTCSeconds());
      return `${yyyy}${mm}${dd}T${HH}${MM}${SS}Z`;
    };

    // Parse "WEEKLY:MO,WE" style strings
    if (typeof recur === 'string') {
      const m = recur.trim().match(/^(\w+)(?::([\w,]+))?$/i);
      if (m) {
        const freq = m[1].toUpperCase();
        const byDay = m[2] ? toByDay(m[2]) : undefined;
        let rule = `FREQ=${freq}`;
        if (byDay && freq === 'WEEKLY') rule += `;BYDAY=${byDay}`;
        return [`RRULE:${rule}`];
      }
    }

    // Object shape
    if (typeof recur === 'object') {
      const freq = (recur.freq || recur.frequency || '').toString().toUpperCase();
      if (!freq) return undefined;

      const parts = [`FREQ=${freq}`];

      const interval = Number(recur.interval || 0);
      if (interval && interval > 0) parts.push(`INTERVAL=${interval}`);

      const byDay = recur.byDay ?? recur.days ?? recur.byweekday;
      const byDayStr = byDay ? toByDay(byDay) : undefined;
      if (byDayStr && (freq === 'WEEKLY' || freq === 'MONTHLY' || freq === 'YEARLY')) {
        parts.push(`BYDAY=${byDayStr}`);
      }

      const byMonthDay = recur.byMonthDay ?? recur.bymonthday;
      if (byMonthDay !== undefined) {
        const list = Array.isArray(byMonthDay) ? byMonthDay : [byMonthDay];
        const norm = list.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
        if (norm.length) parts.push(`BYMONTHDAY=${norm.join(',')}`);
      }

      const byMonth = recur.byMonth ?? recur.bymonth;
      if (byMonth !== undefined) {
        const list = Array.isArray(byMonth) ? byMonth : [byMonth];
        const norm = list.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
        if (norm.length) parts.push(`BYMONTH=${norm.join(',')}`);
      }

      const count = Number(recur.count || 0);
      if (count && count > 0) parts.push(`COUNT=${count}`);

      const until = recur.until ? toUtcUntil(recur.until, start) : undefined;
      if (until) parts.push(`UNTIL=${until}`);

      return parts.length ? [`RRULE:${parts.join(';')}`] : undefined;
    }

    return undefined;
  }

  toObject() {
    return {
      id: this.id,
      seriesId: this.seriesId, // include series id
      date: this.date,
      duration: this.duration,
      location: this.location.toObject(),
      room: this.room,
      attendees: this.attendees,
      creator: this.creator,
      status: this.status,
      isRecurring: this.isRecurring,
      recurrence: this.recurrence,
      eventItem: (typeof this.eventItem?.toObject === 'function')
        ? this.eventItem.toObject()
        : this.eventItem || {},
    };
  }

  static createNew(data = {}) {
    const event = super.createNew(data);
    if (data && data.eventItem) {
      event.eventItem = (typeof ZohoEvent?.createNew === 'function')
        ? ZohoEvent.createNew(data.eventItem)
        : data.eventItem;
    }
    if (data && data.location) {
      event.location = 
         CalendarLocation.createNew(data.location);
    }
    event.seriesId = data.seriesId || data.recurringEventId || data.id || null;
    return event;
  }

  static getToRecordMap() {
    return {
      id: 'id',
      title: 'title',
      _description: 'description',
      date: 'start',
      _end: 'end',
      location: 'location',
      // Renamed to attendees (Calendar API terminology)
      attendees: 'attendees',
      creator: 'creator',
      status: 'status',
      isRecurring: 'isRecurring',
      recurrence: 'recurrence',
      _eventItemId: 'eventItemId'
    };
  }

  get eventItemId() {
    const match = this.description?.match(/[?&]itemId=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  // New: parse Advanced Calendar API event resource as fromRecord
  static fromRecord(item) {
    const start = item?.start ? (item.start.dateTime || item.start.date) : null;
    const end = item?.end ? (item.end.dateTime || item.end.date) : null;

    // Filter attendees:
    // - Exclude room/resource attendees (a.resource === true)
    // - Exclude the location email if it was stored in item.location
    var location = item.location? { displayName: item.location } : null;
    const filteredForLocation  = item.attendees? item.attendees.filter(a => a && a.resource && a.email) : [];
    if (filteredForLocation.length > 0) {
      location = filteredForLocation[0];
    }
    const attendees = (item.attendees || [])
      .filter(a => a && a.email)
      .filter(a => !a.resource) 
      .map(a => CalendarContact.fromRecord({ email: a.email }));

    const record = {
      id: item.id,
      seriesId: item.recurringEventId || item.id,
      title: item.summary || '',
      description: item.description || '',
      start: start ? new Date(start) : null,
      end: end ? new Date(end) : null,
      location: location ? CalendarLocation.fromRecord(location) : null,
      // Use attendees (not guests)
      attendees,
      creator: item.creator?.email || item.organizer?.email || '',
      status: item.status || '',
      recurrence: Array.isArray(item.recurrence) ? item.recurrence.slice() : [],
      isRecurring: !!item.recurringEventId || (Array.isArray(item.recurrence) && item.recurrence.length > 0),
    };

    // Use convertRecordToData, then ensure attendees is set
    const data = { eventItem: {}, ...super.convertRecordToData(record, CalendarEvent.getFromRecordMap?.()) };
    data.attendees = attendees;

    if (data._end && data.date) {
      data.duration = (new Date(data._end) - new Date(data.date)) / (1000 * 60 * 60);
    }

    if (data._description) {
      const match = data._description.match(/eventItemId=(\d*)/);
      if (match) {
        data.eventItem.id = match[1];
      } else {
        data.eventItem.description = data._description;
        data.eventItem.type = 'Event';
        data.eventItem.eventType = 'Meeting';
      }
    }

    return new CalendarEvent(data);
  }

  toRecord() {
    this._eventItemId = this.eventItem.id;
    const start = this.date;
    const durationHours = Number(this.eventItem.duration) || 2;
    this._end = start ? new Date(start.getTime() + durationHours * 60 * 60 * 1000) : undefined;
    this._description = this.id ? this.updateDescription() : undefined;
    const record =  super.convertDataToRecord(CalendarEvent.getToRecordMap());
    record.location = this.location ? this.location.toRecord() : undefined;
    return record;
  }


  updateDescription() {
    return CalendarManager.updateDescription(this.id, this.eventItem.id);
  }
}
