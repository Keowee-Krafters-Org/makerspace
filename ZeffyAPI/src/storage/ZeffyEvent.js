// Assuming Event is imported from another module
// Replace the import path with the actual location of Event
import { Event } from '@makerspace/membership-common';

export class ZeffyEvent extends Event {
    constructor(props) {
        super(props);
        // Add any ZeffyEvent-specific initialization here
    }

    static getResourceNameSingular() {
        return this.getResourceNamePlural();
    }

    static getResourceNamePlural() {
        return 'campaigns'; // Zeffy uses "campaigns" for events
    }

    static getFilter() { return { category: 'Event'}; }
    static getToRecordMap() {
        return {
            id: 'id',
            title: 'title',
            description: 'description',
            summary: 'summary',
            bannerUrl: 'banner_url',
            logoUrl: 'logo_url',
            url: 'url',
            currency: 'currency',
            locale: 'locale',
            object: 'object',
            occurrences: 'occurrences',
            status: 'status',
            created: 'created',
            updated: 'updated',
            startDate: 'start_date',
            endDate: 'end_date',
            isArchived: 'is_archived',
            category: 'category',
            imageUrl: 'banner_url',
            // legacy/compat fields
            price: 'rate',
            _hostId: 'host',
            _instructorId: 'instructor',
            location: 'location',
            duration: 'duration',
            sizeLimit: 'cf_attendance_limit',
            type: 'category',
            eventType: 'cf_event_type',
            enabled: 'cf_enabled',
        };
    }

    /**
     * Convert a raw Zeffy event record to a ZeffyEvent instance, converting date fields to ISO strings.
     */
    static fromRecord(record) {
        const convertEpoch = (v) => (typeof v === 'number' && v > 1000000000 ? new Date(v * 1000).toISOString() : v);
        const data = { ...record };
        if ('created' in data) data.created = convertEpoch(data.created);
        if ('updated' in data) data.updated = convertEpoch(data.updated);
        if ('start_date' in data) data.start_date = convertEpoch(data.start_date);
        if ('end_date' in data) data.end_date = convertEpoch(data.end_date);
        // Calculate duration in milliseconds if both dates are present and valid
        if (data.start_date && data.end_date) {
            const start = Date.parse(data.start_date);
            const end = Date.parse(data.end_date);
            if (!isNaN(start) && !isNaN(end)) {
                data.duration = end - start;
            }
        }
        return new ZeffyEvent(data);
    }
    // Implement or override Event methods as needed
}


