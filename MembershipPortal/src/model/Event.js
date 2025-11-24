import { Entity } from './Entity.js';
export class Event extends Entity{
  constructor(data = {}) {
    super(data.id);
    this.date = data.date || null;
    this.duration = data.duration || 0; // in hours
    this.title = data.title || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.location = data.location || '';
    this.host = data.host || null; // { name: '', contact: '' }
    this.image = data.image || null; // { url: '', altText: '' }
    this.attendees = Array.isArray(data.attendees) ? data.attendees : []; // array of Member or { id, firstName, lastName, email }
    this.sizeLimit = data.sizeLimit || 0; // 0 means no limit
    this.eventItem = data.eventItem || null; // linked event item with more details
    // copy any other properties from data to this object
    Object.assign(this, data || {});
  }

  static fromObject(data = {}) {
    return new Event(data);
  }

  getTitle() {
    return this?.eventItem?.title || this?.title || this?.name || 'Event';
  }

  getDate() {
    const d = this?.date;
    return typeof d === 'string' ? new Date(d) : d;
  }

  getDurationHours() {
    const v = this?.eventItem?.duration ?? this?.duration ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  getHostName() {
    return (
      this?.host?.name ||
      this?.eventItem?.host?.name ||
      this?.eventItem?.instructor?.name ||
      this?.hostName ||
      this?.instructorName ||
      this?.eventItem?.instructorName ||
      ''
    );
  }

  getLocationName() {
    return this?.location?.description || this?.location?.name || this?.location || '';
  }

  getImageUrl() {
    return this?.eventItem?.image?.url || this?.image?.url || '';
  }

  getAttendees() {
    return Array.isArray(this?.attendees) ? this.attendees : [];
  }

  getAttendeeCount() {
    return this.getAttendees().length;
  }

  getSizeLimit() {
    const v = this?.eventItem?.sizeLimit ?? this?.sizeLimit ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  hasSizeLimit() {
    return this.getSizeLimit() > 0;
  }

  getSpotsAvailable() {
    return this.hasSizeLimit() ? Math.max(0, this.getSizeLimit() - this.getAttendeeCount()) : null;
  }

  isMemberRegistered(memberOrEmail) {
    const email = typeof memberOrEmail === 'string'
      ? memberOrEmail
      : (memberOrEmail?.emailAddress || memberOrEmail?.email || '');
    if (!email) return false;
    return this.getAttendees().some(a => (a.emailAddress || a.email) === email);
  }

  isSoldOutFor(memberOrEmail) {
    const spots = this.getSpotsAvailable();
    const isRegistered = this.isMemberRegistered(memberOrEmail);
    return this.hasSizeLimit() && spots === 0 && !isRegistered;
  }
}