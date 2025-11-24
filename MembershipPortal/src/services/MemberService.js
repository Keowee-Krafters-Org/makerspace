import { Member } from '../model/Member.js';

export class MemberService {
  constructor(connector, appService) {
    this.connector = connector;
    this.appService = appService || null;
  }

  async withSpinner(fn) {
    const svc = this.appService;
    if (svc && typeof svc.withSpinner === 'function') return svc.withSpinner(fn);
    try {
      if (svc?.session) svc.session.loading = true;
      return await fn();
    } finally {
      if (svc?.session) svc.session.loading = false;
    }
  }

  get isGAS() {
    try {
      const env = this.connector?.getDeploymentEnvironment?.() || 'unknown';
      return env === 'gas';
    } catch {
      return false;
    }
  }

  toMember(obj) {
    if (!obj || typeof obj !== 'object') return null;
    return Member.ensure(obj);
  }

  fromResponseToMember(raw) {
    const resp = raw || {};
    const candidate =
      resp?.data?.member ??
      resp?.member ??
      resp?.data ??
      (resp?.id || resp?.emailAddress || resp?.email ? resp : null);
    return candidate ? this.toMember(candidate) : null;
  }

  fromResponseToMembers(raw) {
    const resp = raw || {};
    const list =
      (Array.isArray(resp?.data?.members) && resp.data.members) ||
      (Array.isArray(resp?.members) && resp.members) ||
      (Array.isArray(resp?.data) && resp.data) ||
      (Array.isArray(resp?.list) && resp.list) ||
      [];
    return list.map(m => this.toMember(m)).filter(Boolean);
  }

  mapFn(name) {
    if (!this.isGAS) return name;
    const gasMap = {
      requestToken: 'login',
      resendToken: 'login',
      verifyCode: 'verifyToken',
      logout: 'logout',
    };
    return gasMap[name] || name;
  }

  async requestToken(email) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('requestToken');
      const raw = await this.connector.invoke(fn, email);
      return this.fromResponseToMember(raw) || null;
    });
  }

  async resendToken(email) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('resendToken');
      return await this.connector.invoke(fn, email);
    });
  }

  async verifyCode(email, token) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('verifyCode');
      const args = this.isGAS ? [email, token] : [{ email, token }];
      const obj = await this.connector.invoke(fn, ...args) || {};
      const member = this.fromResponseToMember(obj);
      if (member) return { ...obj, member };
      return obj;
    });
  }

  async logout(email) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('logout');
      const resp = await this.connector.invoke(fn, email);
      if (this.appService?.session) this.appService.session.member = null;
      return resp;
    });
  }

  unwrapList(resp) {
    const list =
      (Array.isArray(resp?.data?.members) && resp.data.members) ||
      (Array.isArray(resp?.members) && resp.members) ||
      (Array.isArray(resp?.data) && resp.data) ||
      (Array.isArray(resp?.list) && resp.list) ||
      [];
    const page = resp?.page || resp?.data?.page || resp?.pagination || {};
    const nextToken = page?.nextToken || page?.nextPageToken || resp?.nextPageToken || resp?.data?.nextPageToken || null;
    const hasMore =
      (typeof page?.hasMore === 'boolean' && page.hasMore) ||
      (nextToken ? true : undefined);
    return { list, page, nextToken, hasMore };
  }

  async listMembers(params = {}) {
    const callParams = {
      page: params.currentPage ?? 1,
      pageSize: params.pageSize ?? 10,
      search: params.search || '',
      filter: params.filter || '',
    };
    if (params.pageToken) callParams.pageToken = params.pageToken;

    const raw = await this.connector.invoke('getAllMembers', callParams);
    const { list, page, nextToken, hasMore } = this.unwrapList(raw || {});
    const cursorMode = !!(nextToken || page?.prevToken || page?.nextPageToken);
    const inferredHasMore = cursorMode ? !!nextToken : (Array.isArray(list) && list.length >= (callParams.pageSize || 10));
    const rows = (list || []).map(m => this.toMember(m)).filter(Boolean);

    return {
      rows,
      page: { currentPage: page?.currentPage ?? callParams.page, hasMore: hasMore ?? inferredHasMore, nextToken: nextToken || null },
      cursorMode,
    };
  }

  async getMemberById(id) {
    if (!id) throw new Error('Missing member id');
    try {
      const raw = await this.connector.invoke('getMemberById', id);
      const member = this.fromResponseToMember(raw);
      if (member?.id) return member;
    } catch {}
    const { rows } = await this.listMembers({ currentPage: 1, pageSize: 10, search: String(id), filter: '' });
    const found = rows.find(m => String(m.id) === String(id)) || null;
    if (!found) throw new Error('Member not found');
    return found;
  }

  async getMemberByEmail(email) {
    if (!email) throw new Error('Missing member email');
    try {
      const raw = await this.connector.invoke('getMemberByEmail', email);
      const member = this.fromResponseToMember(raw);
      if (member && (member.emailAddress || member.id)) return member;
    } catch {}
    const { rows } = await this.listMembers({ currentPage: 1, pageSize: 10, search: email, filter: '' });
    const lower = String(email).toLowerCase();
    const found = rows.find(m => (m.emailAddress || '').toLowerCase() === lower) || rows[0] || null;
    if (!found) throw new Error('Member not found');
    return found;
  }

  async getMemberForEditor({ id, email }) {
    if (id) return this.getMemberById(id);
    if (email) return this.getMemberByEmail(email);
    throw new Error('No member id or email provided.');
  }

  async findMemberByEmail(email) {
    if (!email) return null;
    try {
      return await this.getMemberByEmail(email);
    } catch (e) {
      const msg = (e?.message || '').toLowerCase();
      if (msg.includes('not found') || msg.includes('no member')) return null;
      return null;
    }
  }

  buildPrefilledFormUrl(section, member, opts = {}) {
    try {
      const embedded = opts.embedded !== false;
      const forms = this.appService?.config?.forms || {};
      const cfg = (typeof section === 'string') ? (forms[section] || {}) : (section || {});
      const formId = cfg.formId || '';
      const publicUrl = cfg.publicUrl || cfg.url || '';

      let base = '';
      if (publicUrl) {
        base = publicUrl
          .replace('/viewform?embedded=true', '/viewform')
          .replace('/viewform?usp=sf_link', '/viewform');
      } else if (formId) {
        base = `https://docs.google.com/forms/d/e/${formId}/viewform`;
      } else {
        return '';
      }

      const url = new URL(base);
      if (embedded) url.searchParams.set('embedded', 'true');

      const map = cfg.prefillMap || cfg.entryMap || {};
      const m = member || {};

      const get = (v) => (v == null ? '' : String(v));
      const add = (key, value) => {
        if (!value) return;
        const entryKey = map[key];
        if (entryKey) url.searchParams.set(entryKey, get(value));
      };

      const email = m.emailAddress || m.email || '';
      const first = m.firstName || '';
      const last = m.lastName || '';
      const full = (first || last) ? `${first} ${last}`.trim() : (m.name || '');

      add('emailAddress', email);
      add('email', email);
      add('firstName', first);
      add('lastName', last);
      add('name', full);
      add('fullName', full);
      add('phoneNumber', m.phoneNumber || m.phone || '');
      add('memberId', m.id || '');
      add('id', m.id || '');

      const prefillValues = cfg.prefillValues || {};
      Object.entries(prefillValues).forEach(([entryKey, value]) => {
        if (entryKey && value != null) url.searchParams.set(entryKey, get(value));
      });

      return url.toString();
    } catch {
      return '';
    }
  }

  async addMemberRegistration(payload) {
    const obj = payload instanceof Member
      ? payload.toUpdateRequest({ registrationStatus: payload?.registration?.status || 'PENDING' })
      : (typeof payload === 'string' ? JSON.parse(payload) : { ...(payload || {}) });

    delete obj.contacts;
    delete obj.primaryContactId;

    return this.withSpinner(async () => {
      const raw = await this.connector.invoke('addMemberRegistration', obj);
      const member = this.fromResponseToMember(raw);
      if (member) return { ...raw, member };
      if (obj.emailAddress) {
        try { return { ...raw, member: await this.getMemberByEmail(obj.emailAddress) }; } catch {}
      }
      return raw;
    });
  }
}