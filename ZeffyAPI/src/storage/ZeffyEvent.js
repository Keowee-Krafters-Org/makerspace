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

    static getFilter() { return { category: 'Event,Custom' }; }

    static applyDefaultFilter(items, params = {}) {
        // Default behavior: show upcoming events unless explicitly disabled.
        if (params.includePast || params.upcoming === false) {
            return items;
        }

        const now = Date.now();
        return (Array.isArray(items) ? items : []).filter((item) => {
            const start = this.pickFirst(item, ['startDate', 'date']);
            const startTime = this.parseTime(start);
            return startTime !== null && startTime >= now;
        });
    }

    static isDateLikeKey(key) {
        return /(^|_)(date|at|time|start|end)$/i.test(String(key || ''))
            || /^(created|updated|createdAt|updatedAt|startsAt|endsAt)$/i.test(String(key || ''));
    }

    static toIsoDateString(value) {
        if (value == null) {
            return null;
        }

        let date;
        if (value instanceof Date) {
            date = value;
        } else if (typeof value === 'number' && Number.isFinite(value)) {
            const timestamp = Math.abs(value) < 1e11 ? value * 1000 : value;
            date = new Date(timestamp);
        } else if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) {
                return null;
            }

            const numeric = Number(trimmed);
            if (Number.isFinite(numeric)) {
                const timestamp = Math.abs(numeric) < 1e11 ? numeric * 1000 : numeric;
                date = new Date(timestamp);
            } else {
                date = new Date(trimmed);
            }
        }

        return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
    }

    static normalizeDatesDeep(value, keyHint = '') {
        if (value == null) {
            return value;
        }

        if (this.isDateLikeKey(keyHint)) {
            const iso = this.toIsoDateString(value);
            if (iso) {
                return iso;
            }
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.normalizeDatesDeep(item, keyHint));
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        if (typeof value === 'object') {
            const out = {};
            Object.keys(value).forEach((key) => {
                out[key] = this.normalizeDatesDeep(value[key], key);
            });
            return out;
        }

        return value;
    }

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
            recurrence: 'occurrences',
            status: 'status',
            created: 'created',
            updated: 'updated',
            date: 'start_date',
            end: 'end_date',
            isRecurring: 'is_recurring',
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
            type: 'category'
        };
    }

    static parseTime(value) {
        const time = Date.parse(value);
        return Number.isNaN(time) ? null : time;
    }

    static pickFirst(obj, keys) {
        for (const key of keys) {
            if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
                return obj[key];
            }
        }
        return null;
    }

    static normalizeDurationMinutes(rawDuration) {
        const numeric = Number(rawDuration);
        if (!Number.isFinite(numeric) || numeric <= 0) {
            return null;
        }

        // Zeffy payloads can carry duration in seconds; convert when clearly too large for minutes.
        if (numeric > 1440) {
            return Math.max(1, Math.round(numeric / 60));
        }

        return Math.round(numeric);
    }

    /**
     * Convert a raw Zeffy event record to a ZeffyEvent instance, converting date fields to ISO strings.
     */
    static fromRecord(record) {
        const data = this.convertRecordToData(record, this.getFromRecordMap());
        const normalized = this.normalizeDatesDeep(data);

        // Normalize recurrence naming to match Calendar/Event model conventions.
        normalized.recurrence = Array.isArray(normalized.recurrence) ? normalized.recurrence : [];
        if (typeof normalized.isRecurring !== 'boolean') {
            normalized.isRecurring = normalized.recurrence.length > 1;
        }

        // Avoid duplicate recurrence aliases in serialized payloads.
        delete normalized.occurrences;

        // When top-level boundaries are missing, use first occurrence to keep events inside the right day.
        const primaryOccurrence = normalized.recurrence.length > 0 ? normalized.recurrence[0] : null;
        if (primaryOccurrence && typeof primaryOccurrence === 'object') {
            if (!normalized.date) {
                normalized.date = this.pickFirst(primaryOccurrence, ['start', 'start_date', 'date']);
            }
            if (!normalized.end) {
                normalized.end = this.pickFirst(primaryOccurrence, ['end', 'end_date']);
            }
        }

        normalized.title = normalized.title || normalized.name || 'Untitled Class';
        normalized.description = normalized.description || normalized.summary || '';
        normalized.imageUrl = normalized.imageUrl || normalized.bannerUrl || normalized.logoUrl || null;
        normalized.url = normalized.url || normalized.public_url || '';

        // Canonical event boundaries for MembershipCommon consumers.
        const canonicalStart = this.toIsoDateString(this.pickFirst(normalized, ['startDate', 'date', 'start', 'start_date']));
        const canonicalEnd = this.toIsoDateString(this.pickFirst(normalized, ['endDate', 'end', 'end_date']));

        normalized.startDate = canonicalStart;
        normalized.endDate = canonicalEnd;

        // Keep legacy aliases in sync for downstream callers that still read date/end.
        normalized.date = canonicalStart;
        normalized.end = canonicalEnd;

        // Duration is canonical minutes derived from boundaries when available.
        const start = this.parseTime(normalized.startDate);
        const end = this.parseTime(normalized.endDate);
        if (start !== null && end !== null && end >= start) {
            normalized.duration = Math.max(0, Math.round((end - start) / 60000));
        } else {
            const fallbackMinutes = this.normalizeDurationMinutes(normalized.duration);
            normalized.duration = fallbackMinutes || 0;
            if (start !== null && normalized.duration > 0 && !normalized.endDate) {
                normalized.endDate = new Date(start + normalized.duration * 60000).toISOString();
                normalized.end = normalized.endDate;
            }
        }

        return new ZeffyEvent(normalized);
    }
    // Implement or override Event methods as needed
}


