/**
 * EventManager class to manage events in a membership system.
 * It handles event creation, retrieval, updates, and deletions.
 * It also integrates with a calendar system to manage event scheduling.  
 */
class EventManager {

  constructor(storageManager, calendarManager, membershipManager, fileManager, invoiceManager) {
    this.storageManager = storageManager;
    this.calendarManager = calendarManager;
    this.membershipManager = membershipManager;
    this.invoiceManager = invoiceManager;
    this.fileManager = fileManager;
    this.config = getConfig();
  }

  getEventItemList(params = {}) {
    const result = this.storageManager.getAll(params);
    return result;
  }

  getEventItemById(id) {
    const result = this.storageManager.getById(id);
    return result;
  }

  getEventList(params = {}) {
    const calendarEvents = this.calendarManager.getAll(params);
    return this.enrichCalendarEvents(calendarEvents);
  }

  /**
   * Retrieves upcoming events based on the specified horizon.
   * The horizon can be specified in the params, otherwise it defaults to the configured event horizon.
   * @param {*} params 
   * @returns   {Array} An array of upcoming events enriched with event item data.
   * If no upcoming events are found, an empty array is returned.
   * If an error occurs, it logs the error and returns an empty array.
   * @throws {Error} If there is an issue retrieving the events from the calendar manager
   * or enriching the events with event item data.
   */
  getUpcomingEvents(params = {}) {
    const eventHorizon = params.horizon || getConfig().eventHorizon;
    const calendarEvents = this.calendarManager.getUpcomingEvents(eventHorizon);
    if (!calendarEvents || calendarEvents.length === 0) {
      return [];
    }
    return this.enrichCalendarEvents(calendarEvents);
  }

  /**
   *  Retrieves upcoming classes based on the specified parameters.
   *  It filters the events to include only those of type 'Class'.
   *  The events are sorted by start date in ascending order.
   *  The maximum number of classes to show is limited by the `upcomingClassesLimit` configuration.
   *  @param {Object} params - Optional parameters to filter the events.
   *  @param {number} params.limit - Optional limit on the number of classes to retrieve.
   *  @returns {Array} An array of upcoming classes, each enriched with event
   *  @returns  {Array} An array of upcoming classes, each enriched with event item data.
   *  If no upcoming classes are found, an empty array is returned.
   *  @throws {Error} If there is an issue retrieving the events from the calendar
   */
  getUpcomingClasses(params = {}) {
    const events = this.getUpcomingEvents(params);
    if (!events || events.length === 0) {
      return [];
    }
    return events.filter(event => {
      return event.eventItem && event.eventItem.type === 'Event' && event.eventItem.eventType === 'Class';
    });
  }
  /**
   * Merges calendar events with event items from storage.
   * This function enriches calendar events with additional data from the event items.
   * @param {*} calendarEvents 
   * @returns  {Array} An array of enriched calendar events.
   */
  enrichCalendarEvents(calendarEvents) {
    const enriched = calendarEvents.map(ce => {

      return this.enrichCalendarEvent(ce);
    });
    return enriched.filter(e => e !== null);
  }


  enrichCalendarEvent(calendarEvent) {
    if (calendarEvent.eventItem.id) {
      const result = this.storageManager.getById(calendarEvent.eventItem.id);
      if (!result || !result.data) {
        return null;
      }
      const eventItem = result.data;

      if (eventItem.image && eventItem.image.id) {
        const imageFile = this.fileManager.get(eventItem.image.id);
        eventItem.image = imageFile;
      }
      calendarEvent.eventItem = eventItem;
    }
    return calendarEvent;

  }
  getPastEvents() {
    const response = this.calendarManager.getFiltered(event => event.isPast());
    response.data = response.data.map(e => this.enrichCalendarEvents(e));
    return response;
  }
  getAvailableEvents() {
    const calendarEvents = this.calendarManager.getUpcomingEvents();
    return this.enrichCalendarEvents(calendarEvents);
  }

  getEventById(eventId) {
    const event = this.calendarManager.getById(eventId);
    if (!event) {
      throw new Error(`Event Not Found for: ${eventId}`);
    }
    const newEvent = this.enrichCalendarEvent(event);
    return newEvent;
  }
  getEventsByHost(host) {
    const calendarEvents = this.calendarManager.getFiltered(event => {
      const guests = event.attendees || [];
      return guests.length > 0 && guests[0] === host;
    });
    return this.enrichCalendarEvents(calendarEvents);
  }
  getEventsByDate(date) {
    const calendarEvents = this.calendarManager.getEventsByDate(date);
    return this.enrichCalendarEvents(calendarEvents);
  }
  getEventsByLocation(location) {
    return this.storageManager.getFiltered(event => event.location === location);
  }
  getEventsBySizeLimit(sizeLimit) {
    return this.storageManager.getFiltered(event => event.sizeLimit === sizeLimit);
  }
  getEventsByAttendee(attendeeEmail) {
    const calendarEvents = this.calendarManager.getEventsByAttendee(attendeeEmail);
    return this.enrichCalendarEvents(calendarEvents);
  }

  addEvent(eventData) {
    try {
      const event = this.createEvent(eventData);
      let eventItem = event.eventItem;

      // Handle image upload if image is a base64 string
      this.saveEventImage(eventItem);
      // If eventItem already exists, update it; otherwise, create a new one

      if (eventItem && eventItem.id && eventItem.id !== 'null') {
        const eventItemResponse = this.updateEventItem(eventItem);
        eventItem = eventItemResponse.data;
      } else {
        eventItem = this.addEventItem(eventItem);
      }
      if (!eventItem) {
        throw new Error('Failed to create event item.');
      }
      // Add the event to the calendar
      const newCalendarEvent = this.addCalendarEvent(event, eventItem);
      newCalendarEvent.eventItem = eventItem;
      return { success: true, data: newCalendarEvent };
    } catch (err) {
      console.error('Failed to create event:', err);
      return { success: false, message: 'Failed to create event.', error: err.toString() };
    }
  }

  saveEventImage(eventItem) {
    if (eventItem && eventItem.image && eventItem.image.data && typeof eventItem.image.data === 'string' && eventItem.image.data.startsWith('data:image')) {
      // Upload the image and get the DriveFile object
      const file = this.fileManager.addImage(eventItem.image.data, 'event-image');

      // Modify the URL to use the thumbnail format
      if (file && file.id) {
        file.url = `https://drive.google.com/thumbnail?id=${file.id}`;
      }

      // Store the updated DriveFile object in the eventItem
      eventItem.image = file;
    }
    return eventItem;
  }
  /**
   * Adds a new event item to the storage.
   * @param {*} eventItem 
   * @returns 
   */

  addEventItem(eventItem) {

    return this.storageManager.add(eventItem);
  }

  /**
   * Adds a new event item to the storage.
   * @param {*} eventItem 
   * @returns 
   */

  addEventItemFromData(eventItemData) {
    const eventItem = this.storageManager.createNew(eventItemData);
    return this.addEventItem(eventItem);
  }
  addCalendarEvent(calendarEvent, eventItem) {
    return this.calendarManager.add(calendarEvent, eventItem);
  }


  updateEvent(calendarEvent) {
    try {
      const updatedEvent = this.calendarManager.update(calendarEvent.id, calendarEvent);
      if (calendarEvent.eventItem) {
        const eventItem = calendarEvent.eventItem;
        this.saveEventImage(eventItem);
        let response = this.storageManager.update(eventItem.id, eventItem);
        updatedEvent.eventItem = response.data;
      }
      return new Response(true, updatedEvent, 'Event updated successfully.');
    } catch (err) {
      console.error('Failed to update calendar event:', err);
      return { success: false, message: 'Failed to update calendar event.', error: err.toString() };
    }
  }

  updateEventItem(eventItemData) {
    const eventItem = this.storageManager.createNew(eventItemData);
    return this.storageManager.update(eventItem.id, eventItem);
  }

  deleteEventItem(eventItemId) {
    const event = this.storageManager.getById(eventItemId);
    if (!event) {
      return { success: false, message: 'Event not found.' };
    }
    const response = this.storageManager.delete(eventItemId);
    return { success: true, message: 'Event deleted successfully!' };
  }

  deleteEvent(event) {
    const eventItemId = event.eventItem.id;
    eventManager.deleteEventItem(eventItemId);
    this.deleteCalendarEvent(event);
  }

  deleteCalendarEvent(eventId) {
    this.calendarManager.delete(eventId);
  }

  createEvent(data = {}) {
    const calendarEvent = this.calendarManager.create(data);
    if (!calendarEvent) {
      throw new Error('Failed to create calendar event.');
    }
    const eventItem = this.storageManager.createNew(data.eventItem || {});
    if (!eventItem) {
      throw new Error('Failed to create event item.');
    }
    const host = this.membershipManager.createNew(data.host || {});
    if (!host) {
      throw new Error('Failed to create host.');
    }
    eventItem.host = host;
    calendarEvent.eventItem = eventItem;
    return calendarEvent;
  }

  /**
   * Sign up a member to an event
   * @param {*} eventId 
   * @param {*} memberId 
   * @returns Response(EventConfirmation) 
   */
  signup(eventId, memberId) {
    let invoice;
    const event = this.calendarManager.getById(eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    // Lookup the eventItem
    const eventItemId = event.eventItem.id;
    const eventItemResponse = this.getEventItemById(eventItemId);
    if (!eventItemResponse || !eventItemResponse.success) {
      return (new Response(false, "Failed to sign you up for the event - please contact system administrator"));
    }
    const eventItem = eventItemResponse.data;
    event.eventItem = eventItem;

    // Prevent duplicate signups
    if (Array.isArray(event.attendees) && event.attendees.includes(memberId)) {
      return { success: false, error: 'Member already signed up for this event.' };
    }

    // Check if event is full (use eventItem.sizeLimit)
    const limit = Number(eventItem?.sizeLimit || 0);
    if (limit > 0 && Array.isArray(event.attendees) && event.attendees.length >= limit) {
      return { success: false, error: 'Event is full.' };
    }

    const memberResponse = this.membershipManager.getMember(memberId);
    if (!(memberResponse && memberResponse.success)) {
      throw new Error('Member not found');
    }
    const member = memberResponse.data;

    // Add attendee (by email)
    this.calendarManager.addAttendee(eventId, member.emailAddress);

    // Invoice member if price > 0
    const price = Number(eventItem?.price || 0);
    if (price > 0) {
      const invoiceResponse = this.createInvoiceForEvent(member, event);
      if (!invoiceResponse || invoiceResponse.success === false) {
        return { ...invoiceResponse };
      }
      invoice = invoiceResponse?.data || null;
    }

    return {
      success: true,
      data: {
        message: `You are successfully signed up for: ${event.eventItem.title}. You will receive an email with payment details shortly. Please check your inbox.`,
        eventId: eventId,
        invoice, // optional, may be null if free event
      }
    };
  }

  /**
   * Creates an invoice for a specific event and member.
   * @param {Member} member - The member for whom the invoice is created.
   * @param {Event} event - The event for which the invoice is created.
   * @returns {Object} The created invoice.
   */
  createInvoiceForEvent(member, event) {

    return this.invoiceManager.createInvoiceForEvent(member, event);
  }

  /**
   * Unregister a member from an event
   * @param {string} eventId - The ID of the event
   * @param {string} memberId - The ID of the member
   * @returns {Object} Response indicating success or failure
   */
  unregister(eventId, memberId) {
    try {

      const memberResponse = this.membershipManager.getMember(memberId);
      if (!(memberResponse && memberResponse.success)) {
        return { success: false, error: 'Member not found.' };
      }

      const member = memberResponse.data;

      // Delegate the unregistration to the CalendarManager
      this.calendarManager.unregisterAttendee(eventId, member.emailAddress);

      this.invoiceManager.deleteInvoiceFor(member.id, eventId);

    } catch (err) {
      console.error('Failed to unregister from event:', err);
      return { success: false, message: 'Failed to unregister from event.', error: err.toString() };
    }
    return { success: true, data: { message: `You have been unregistered from event: ${eventId}`, eventId: eventId } };
  }

  enrichWithCalendarData(event) {
    if (event.calendarId) {
      try {
        const calendarEvent = this.calendarManager.calendar.getEventById(event.calendarId);
        if (calendarEvent) {
          event.date = calendarEvent.getStartTime();
          event.end = calendarEvent.getEndTime();
          event.location = calendarEvent.getLocation();
          event.attendees = calendarEvent.getGuestList().map(g => g.getEmail());
        }
      } catch (err) {
        console.warn(`Could not enrich event with calendar data: ${err.message}`);
      }
    }
    return event;
  }

  getEventRooms() {
    return this.calendarManager.getCalendarResources();
  }

  getEventLocations() {
    return this.config.locations;
  }

  getEventItemByTitle(title) {
    const eventItemListResponse = this.storageManager.getAll({ title: title });
    if (eventItemListResponse && eventItemListResponse.success && eventItemListResponse.data.length > 0) {
      return eventItemListResponse.data[0];
    }
  }

  getEventRooms() {
    try {
      const optionalArgs = {

      };
      const resources = AdminDirectory.Resources.Calendars.list('my_customer', optionalArgs);
      return resources.items.map(resource => ({
        id: resource.resourceId,
        name: resource.resourceName,
        email: resource.resourceEmail,
      }));
    } catch (error) {
      Logger.log(`getEventRooms failed: ${error.message}`);
      throw error;
    }
  }
}
