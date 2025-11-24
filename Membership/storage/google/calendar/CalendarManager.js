/**
 * Service managing calendars (Google)
 * Provides the CRUD operations to sync Events to the Calendar
 * 
 */

class CalendarManager extends StorageManager {
  constructor(calendarId = null) {
    super();
    // Prefer configured ID; fall back to default calendar id
    this.calendarId =
      calendarId ||
      (typeof getConfig === 'function' && getConfig()?.calendarId) ||
      CalendarApp.getDefaultCalendar().getId(); // only used to fetch id string
    this.tz =
      (typeof getConfig === 'function' && getConfig()?.timeZone) ||
      Session.getScriptTimeZone() ||
      'UTC';
  }

  // ---- Utilities ----
  toDateTime_(d) {
    const dt = d instanceof Date ? d : new Date(d);
    return { dateTime: dt.toISOString(), timeZone: this.tz };
  }

  // Resolve an API event by id (or iCalUID via list)
  get(id) {
    // Correct signature: get(calendarId, eventId)
    try {
      return Calendar.Events.get(this.calendarId, String(id));
    } catch (e) {
      const res = Calendar.Events.list(this.calendarId, { iCalUID: String(id), singleEvents: true, maxResults: 1 });
      const item = (res.items || [])[0];
      if (!item) throw e;
      return item;
    }
  }

  /**
   * Converts an Advanced Calendar API event resource to a CalendarEvent instance
   */
  fromRecord(item) {
    const ev = CalendarEvent.fromRecord(item); // API parser
    // Map location email to resource object if available
    const locationEmail = ev.location || '';
    if (locationEmail) {
      const calendarLocation = this.getLocationByEmail(locationEmail);
      if (calendarLocation) {
        ev.location = calendarLocation;
      }
    }
    return ev;
  }

  /**
   * Build an API Events resource from a CalendarEvent + optional eventItem
   */
  buildResource_(calendarEvent, eventItem) {
    const rec = calendarEvent.toRecord();
    const title = calendarEvent.title || rec.title || 'Untitled Class';
    const start = rec.start || calendarEvent.start || calendarEvent.date;
    const durationHrs = Number(calendarEvent.eventItem?.duration ?? calendarEvent.duration ?? 2) || 2;
    const end = rec.end || (start ? new Date((start instanceof Date ? start : new Date(start)).getTime() + durationHrs * 60 * 60 * 1000) : null);
    const roomEmail = calendarEvent.location?.email || rec.location?.email || '';

    const attendees = [];
    if (roomEmail) attendees.push({ email: roomEmail, resource: true, responseStatus: 'accepted' });

    const resource = {
      summary: title,
      description: '',
      start: this.toDateTime_(start),
      end: this.toDateTime_(end),
      attendees,
      location: roomEmail || '',
    };

    // Convert simplified recurrence to RRULEs if provided
    const rrules = CalendarEvent.normalizeRecurrenceToApi(calendarEvent.recurrence, start);
    if (Array.isArray(rrules) && rrules.length > 0) {
      resource.recurrence = rrules;
    }

    return resource;
  }

  /**
   * Creates a CalendarEvent instance and persists it via API
   */
  create(eventData) {
    return CalendarEvent.createNew(eventData); 
  }
  /**
   * Creates a calendar event via API and returns the created event
   */
  add(calendarEvent, eventItem) {
    const resource = this.buildResource_(calendarEvent, eventItem);
    const created = Calendar.Events.insert(resource, this.calendarId);

    const description = CalendarManager.updateDescription(created.id, eventItem.id);
    Calendar.Events.patch({ description }, this.calendarId, created.id);

    const item = Calendar.Events.get(this.calendarId, created.id);
    return this.fromRecord(item);
  }

  /**
   * Update an existing event via API
   */
  update(id, calendarEvent) {
    const current = this.get(id);

    const rec = calendarEvent.toRecord();
    const start = rec.start || new Date(current.start.dateTime || current.start.date);
    const end = rec.end || new Date(current.end.dateTime || current.end.date);
    const summary = calendarEvent.title || current.summary || 'Untitled Class';
    const description = CalendarManager.updateDescription(current.id, calendarEvent.eventItem.id);

    const currentAttendees = Array.isArray(current.attendees) ? current.attendees.slice() : [];
    const roomEmails = (this.getCalendarResources() || []).map(r => r.email);
    const newRoom = calendarEvent.location?.email || '';
    let attendees = currentAttendees;
    if (newRoom) {
      attendees = currentAttendees.filter(a => !roomEmails.includes(a.email) || a.email === newRoom);
      if (!attendees.some(a => a.email === newRoom)) {
        attendees.push({ email: newRoom, resource: true, responseStatus: 'accepted' });
      }
    }

    const patch = {
      summary,
      description,
      start: this.toDateTime_(start),
      end: this.toDateTime_(end),
      attendees,
      location: newRoom || current.location || '',
    };

    // Apply recurrence (convert simplified to RRULEs). If explicitly null, clear recurrence.
    if (calendarEvent.recurrence === null) {
      patch.recurrence = []; // clearing recurrence removes series
    } else {
      const rrules = CalendarEvent.normalizeRecurrenceToApi(calendarEvent.recurrence, start);
      if (Array.isArray(rrules)) {
        patch.recurrence = rrules;
      }
    }

    Calendar.Events.patch(patch, this.calendarId, current.id);
    const updated = Calendar.Events.get(this.calendarId, current.id);
    return this.fromRecord(updated);
  }

  /**
   * Delete an event via API.
   * By default deletes just the specified event/occurrence.
   * Pass { series: true } to delete the entire recurring series.
   * Accepts either API event id or iCalUID.
   * @param {string} eventId
   * @param {{series?: boolean}} [options]
   */
  delete(eventId, options = {}) {
    const { series = false } = options;
    const current = this.get(eventId);
    if (!current) throw new Error(`Event not found: ${eventId}`);

    const idToDelete = series && current.recurringEventId
      ? current.recurringEventId
      : current.id;

    // FIX: use remove(), not delete()
    Calendar.Events.remove(this.calendarId, String(idToDelete));
    return true;
  }

  /**
   * Retrieve a single event via API (accepts API id or iCalUID)
   */
  getEvent(eventId) {
    const item = this.get(eventId);
    return item ? this.fromRecord(item) : null;
  }

  getUpcomingEvents(daysAhead = 14) {
    const now = new Date();
    const end = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return this.getEventsInRange(now, end);
  }

  /**
   * Retrieve events in a range (flattened instances)
   */
  getEventsInRange(start, end) {
    if (!(start instanceof Date) || !(end instanceof Date)) {
      throw new Error('Start and end must be Date objects.');
    }
    if (start >= end) throw new Error('Start date must be before end date.');

    const res = Calendar.Events.list(this.calendarId, {
      singleEvents: true,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      orderBy: 'startTime',
      maxResults: 250,
    });
    return (res.items || []).map(item => this.fromRecord(item));
  }

  /**
   * Complies with StorageManager.getById
   */
  getById(id) {
    return this.getEvent(id);
  }

  getEventByTitle(title, timeMin = new Date(), timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
    const res = Calendar.Events.list(this.calendarId, {
      q: String(title),
      singleEvents: true,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 25,
      orderBy: 'startTime',
    });
    const item = (res.items || []).find(i => String(i.summary || '').trim() === String(title).trim());
    if (!item) throw new Error(`Event Not Found for title: ${title}`);
    return this.fromRecord(item);
  }

  getAll(params = {}) {
    return this.getUpcomingEvents(365);
  }

  getFiltered(filterFn) {
    const all = this.getAll();
    return all.filter(filterFn);
  }

  updateById(id, calendarEvent) {
    if (!calendarEvent || id !== calendarEvent.id) {
      throw new Error('Invalid calendar event or mismatched ID');
    }
    return this.update(id, calendarEvent);
  }

  // Calendar resources (rooms)
  getCalendarResources() {
    const customerId = 'my_customer';
    try {
      const resources = AdminDirectory.Resources.Calendars.list(customerId).items || [];
      return resources.map(resource => CalendarLocation.fromRecord(resource));
    } catch (e) {
      Logger.log('Error fetching calendar resources: ' + e);
      return [];
    }
  }

  static matchInstanceByStart_(inst, start) {
    const s = (start instanceof Date) ? start : new Date(start);
    const dt =
      inst.originalStartTime?.dateTime ||
      inst.originalStartTime?.date ||
      inst.start?.dateTime ||
      inst.start?.date;
    return dt && new Date(dt).getTime() === s.getTime();
  }

  /**
   * Add a guest to a single occurrence via API
   */
  addAttendee(eventOrId, emailAddress, startTime) {
    const isObj = eventOrId && typeof eventOrId === 'object';
    const seriesId = isObj ? (eventOrId.seriesId || eventOrId.id) : String(eventOrId);
    const start = (isObj ? (eventOrId.start || eventOrId.date) : startTime);
    if (!seriesId) throw new Error('addAttendee requires a series id');
    if (!start) throw new Error('addAttendee requires the occurrence start time');

    const windowStart = (start instanceof Date) ? start : new Date(start);
    const windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000);

    const res = Calendar.Events.instances(this.calendarId, seriesId, {
      timeMin: windowStart.toISOString(),
      timeMax: windowEnd.toISOString(),
      maxResults: 25,
      singleEvents: true,
    });

    const match = (res.items || []).find(inst => CalendarManager.matchInstanceByStart_(inst, windowStart));
    if (!match) throw new Error('Occurrence not found for provided start time');

    const attendees = Array.isArray(match.attendees) ? match.attendees.slice() : [];
    const exists = attendees.some(a => (a.email || '').toLowerCase() === String(emailAddress).toLowerCase());
    if (!exists) attendees.push({ email: emailAddress });

    Calendar.Events.patch({ attendees }, this.calendarId, match.id);

    return this.fromRecord(Calendar.Events.get(this.calendarId, match.id));
  }

  /**
   * Remove a guest from a single occurrence via API
   */
  unregisterAttendee(eventOrId, email, startTime) {
    const isObj = eventOrId && typeof eventOrId === 'object';
    const seriesId = isObj ? (eventOrId.seriesId || eventOrId.id) : String(eventOrId);
    const start = (isObj ? (eventOrId.start || eventOrId.date) : startTime);
    if (!seriesId) throw new Error('unregisterAttendee requires a series id');
    if (!start) throw new Error('unregisterAttendee requires the occurrence start time');

    const windowStart = (start instanceof Date) ? start : new Date(start);
    const windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000);

    const res = Calendar.Events.instances(this.calendarId, seriesId, {
      timeMin: windowStart.toISOString(),
      timeMax: windowEnd.toISOString(),
      maxResults: 25,
      singleEvents: true,
    });

    const match = (res.items || []).find(inst => CalendarManager.matchInstanceByStart_(inst, windowStart));
    if (!match) return { success: false, error: 'Occurrence not found for provided start time.' };

    const attendees = Array.isArray(match.attendees) ? match.attendees : [];
    const next = attendees.filter(a => (a.email || '').toLowerCase() !== String(email).toLowerCase());
    Calendar.Events.patch({ attendees: next }, this.calendarId, match.id);

    return {
      success: true,
      message: `Attendee ${email} removed from this occurrence.`,
      eventId: seriesId,
      data: this.fromRecord(Calendar.Events.get(this.calendarId, match.id)),
    };
  }

  // Add a guest directly to the specified event (instance id)
  addAttendeeById(eventId, email) {
    const ev = this.get(String(eventId)); // resolve API id or iCalUID
    if (!ev) throw new Error(`Event not found: ${eventId}`);

    const attendees = Array.isArray(ev.attendees) ? ev.attendees.slice() : [];
    const exists = attendees.some(a => (a.email || '').toLowerCase() === String(email).toLowerCase());
    if (!exists) attendees.push({ email: email });

    Calendar.Events.patch({ attendees }, this.calendarId, ev.id);
    return this.fromRecord(Calendar.Events.get(this.calendarId, ev.id));
  }

  // Remove a guest directly from the specified event (instance id)
  unregisterAttendeeById(eventId, email) {
    const ev = this.get(String(eventId));
    if (!ev) return { success: false, error: 'Event not found.' };

    const attendees = Array.isArray(ev.attendees) ? ev.attendees : [];
    const next = attendees.filter(a => (a.email || '').toLowerCase() !== String(email).toLowerCase());

    Calendar.Events.patch({ attendees: next }, this.calendarId, ev.id);
    return {
      success: true,
      message: `Attendee ${email} removed from this occurrence.`,
      eventId: ev.id,
      data: this.fromRecord(Calendar.Events.get(this.calendarId, ev.id)),
    };
  }

  // Keep updateDescription unchanged
  static updateDescription(eventId, eventItemId) {
    const updatedDescription = `<a href="${getConfig().baseUrl}?view=event&eventId=${eventId}&eventItemId=${eventItemId}">View Details</a>`;
    return updatedDescription;
  }

  // Location helpers
  getLocationByEmail(email) {
    return this.getCalendarResources().find(r => r.email === email);
  }
  getLocationById(id) {
    return this.getCalendarResources().find(r => r.id === id);
  }
}