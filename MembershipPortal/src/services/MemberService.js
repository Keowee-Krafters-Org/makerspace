import { Member } from '../model/Member.js';

export class MemberService {
  constructor(connector, appService) {
    if (!connector) throw new Error('MemberService requires a ServiceConnector');
    if (!appService) throw new Error('MemberService requires AppService');
    this.connector = connector;
    this.app = appService;
  }

  static normalize(res) {
    // Matches EventService.normalize
    return (res && typeof res === 'object' && 'success' in res && 'data' in res) ? res.data : res;
  }

  // Former requestToken(emailAddress)
  requestToken(emailAddress) {
    if (!emailAddress) throw new Error('Email address is required to request a token.');
    return this.app.withSpinner(async () => {
      const res = await this.connector.invoke('login', emailAddress);
      const data = MemberService.normalize(res);
      return new Member(data);
    });
  }

  // Former verifyCode(emailAddress, token)
  verifyCode(emailAddress, token) {
    if (!token) throw new Error('Verification token is required.');
    return this.app.withSpinner(async () => {
      const raw = await this.connector.invoke('verifyToken', emailAddress, token);
      // Preserve redirectToForm if backend returns wrapper with metadata
      const obj = (raw && typeof raw === 'object') ? raw : {};
      if ('success' in obj) {
        if (obj.redirectToForm) {
          const url = MemberService.buildPrefilledFormUrlFromEntryMap(
            obj.formUrl,
            obj.entryMap,
            obj.data || { emailAddress }
          );
          return { redirectToForm: true, url, raw: obj };
        }
        return { redirectToForm: false, member: new Member(obj.data) };
      }
      // Fallback to normalized member data
      const data = MemberService.normalize(raw);
      return { redirectToForm: false, member: new Member(data) };
    });
  }

  // Former resendToken(emailAddress) – same endpoint as login
  resendToken(emailAddress) {
    if (!emailAddress) throw new Error('Email address is required to resend a token.');
    return this.app.withSpinner(async () => {
      const res = await this.connector.invoke('login', emailAddress);
      const data = MemberService.normalize(res);
      return new Member(data);
    });
  }

  logout(emailAddress) {
    return this.app.withSpinner(async () => {
      return this.connector.invoke('logout', emailAddress);
    });
  }

  // Helper: build prefilled form URL
  static buildPrefilledFormUrlFromEntryMap(formUrl, entryMap = {}, member = {}) {
    const url = new URL(formUrl);
    if (entryMap.email || entryMap.emailAddress) {
      url.searchParams.set(entryMap.email || entryMap.emailAddress, member.emailAddress || member.email || '');
    }
    if (entryMap.firstName && member.firstName) url.searchParams.set(entryMap.firstName, member.firstName);
    if (entryMap.lastName && member.lastName) url.searchParams.set(entryMap.lastName, member.lastName);
    if (entryMap.name && (member.firstName || member.lastName)) {
      url.searchParams.set(entryMap.name, [member.firstName, member.lastName].filter(Boolean).join(' '));
    }
    return url.toString();
  }
}