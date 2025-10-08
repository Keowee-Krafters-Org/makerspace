import { Entity } from './Entity.js';
export class Member extends Entity{
    constructor(data = {}) {
        super(data.id);
        // primitives
        this.name = data.name ?? '';
        this.emailAddress = data.emailAddress ?? data.email ?? '';
        this.firstName = data.firstName ?? '';
        this.lastName = data.lastName ?? '';
        this.phoneNumber = data.phoneNumber ?? data.phone ?? '';
        // arrays
        this.interests = Array.isArray(data.interests)
          ? [...data.interests]
          : (typeof data.interests === 'string'
              ? data.interests.split(',').map(s => s.trim()).filter(Boolean)
              : []);
        // nested registration
        const reg = data.registration || {};
        this.registration = {
          status: reg.status ?? '',
          level: reg.level ?? '',
          waiverSigned: !!reg.waiverSigned,
          waiverPdfLink: reg.waiverPdfLink ?? '',
        };
        // any other fields preserved
        Object.keys(data).forEach(k => {
          if (!(k in this)) this[k] = data[k];
        });
    }

     // Positive criteria: PENDING or REGISTERED
  canSignup() {
    const s = String(
      (this.registration && this.registration.status) ||
      (this.registration && this.registration.toObject && this.registration.toObject().status) ||
      ''
    ).toUpperCase();
    return s === 'PENDING' || s === 'REGISTERED';
  }

    static ensure(obj) {
      return obj instanceof Member ? obj : new Member(obj || {});
    }

    static clone(obj) {
      return new Member(JSON.parse(JSON.stringify(obj || {})));
    }

    toUpdateRequest({ registrationStatus } = {}) {
      const firstName = (this.firstName || '').trim();
      const lastName = (this.lastName || '').trim();
      const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (this.name || '');
      return {
        id: this.id || undefined,
        name,
        emailAddress: this.emailAddress,
        firstName,
        lastName,
        phoneNumber: (this.phoneNumber || '').trim(),
        interests: Array.isArray(this.interests) ? [...this.interests] : [],
        registration: {
          level: this.registration?.level || '',
          status: registrationStatus ?? (this.registration?.status || ''),
          waiverSigned: !!this.registration?.waiverSigned,
          waiverPdfLink: this.registration?.waiverPdfLink || '',
        },
      };
    }
}
