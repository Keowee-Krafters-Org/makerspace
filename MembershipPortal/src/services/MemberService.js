import { Member } from '../model/Member.js';

export class MemberService {
  constructor(connector, appService) {
    this.connector = connector;
    this.appService = appService || null;
  }

  // Spinner-safe wrapper
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

  // Detect GAS connector
  get isGAS() {
    return this.connector?.constructor?.name === 'GoogleServiceConnector';
  }

  // --- helpers to normalize responses to Member/Member[] ---
  toJson(obj) {
    if (typeof obj === 'string') {
      try { return JSON.parse(obj); } catch { return obj; }
    }
    return obj;
  }
  toMember(obj) {
    if (!obj || typeof obj !== 'object') return null;
    return Member.ensure(obj);
  }
  fromResponseToMember(raw) {
    const resp = this.toJson(raw) || {};
    // common shapes
    const candidate =
      resp?.data?.member ??
      resp?.member ??
      resp?.data ??
      (resp?.id || resp?.emailAddress || resp?.email ? resp : null);
    return candidate ? this.toMember(candidate) : null;
  }
  fromResponseToMembers(raw) {
    const resp = this.toJson(raw) || {};
    const list =
      (Array.isArray(resp?.data?.members) && resp.data.members) ||
      (Array.isArray(resp?.members) && resp.members) ||
      (Array.isArray(resp?.data) && resp.data) ||
      (Array.isArray(resp?.list) && resp.list) ||
      [];
    return list.map(m => this.toMember(m)).filter(Boolean);
  }

  normalizeResponse(res) {
    // keep for non-member responses
    if (!res) return {};
    if (typeof res === 'string') {
      try { return JSON.parse(res); } catch { return {}; }
    }
    return res;
  }

  // Map SPA method names to GAS function names
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

  // ---- Auth methods ----

  async requestToken(email) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('requestToken');
      const raw = await this.connector.invoke(fn, email);
      const member = this.fromResponseToMember(raw);
      return member || null;
    });
  }

  async resendToken(email) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('resendToken');
      // resend usually doesn't return a member; keep original behavior
      return this.normalizeResponse(await this.connector.invoke(fn, email));
    });
  }

  async verifyCode(email, token) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('verifyCode');
      const args = this.isGAS ? [email, token] : [{ email, token }];
      const raw = await this.connector.invoke(fn, ...args);
      const obj = this.toJson(raw) || {};
      // Preserve non-member fields, but coerce any returned member to Member
      const member = this.fromResponseToMember(obj);
      if (member) return { ...obj, member };
      return obj;
    });
  }

  async logout(email) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('logout');
      const resp = this.normalizeResponse(await this.connector.invoke(fn, email));
      if (this.appService?.session) this.appService.session.member = null;
      return resp;
    });
  }

  // ---- Listing helpers ----
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
      currentPage: params.currentPage ?? 1,
      pageSize: params.pageSize ?? 10,
      search: params.search || '',
      filter: params.filter || '',
    };
    if (params.pageToken) callParams.pageToken = params.pageToken;

    const raw = await this.connector.invoke('getAllMembers', callParams);
    const resp = this.normalizeResponse(raw);
    const { list, page, nextToken, hasMore } = this.unwrapList(resp);

    const cursorMode = !!(nextToken || page?.prevToken || page?.nextPageToken);
    const inferredHasMore = cursorMode ? !!nextToken : (Array.isArray(list) && list.length >= (callParams.pageSize || 10));

    // Map rows to Member instances
    const rows = (list || []).map(m => this.toMember(m)).filter(Boolean);

    return {
      rows,
      page: { currentPage: page?.currentPage ?? callParams.currentPage, hasMore: hasMore ?? inferredHasMore, nextToken: nextToken || null },
      cursorMode,
    };
  }

  // ---- Member fetch helpers ----
  ensureMemberShape(data) {
    if (!data || typeof data !== 'object') return null;
    // Ensure registration subtree, then wrap as Member
    const normalized = {
      registration: { status: '', level: '', waiverSigned: false, waiverPdfLink: '' },
      ...data,
      registration: { status: '', level: '', waiverSigned: false, waiverPdfLink: '', ...(data.registration || {}) },
    };
    return this.toMember(normalized);
  }

  async getMemberById(id) {
    if (!id) throw new Error('Missing member id');
    try {
      const raw = await this.connector.invoke('getMemberById', id);
      const member = this.fromResponseToMember(raw);
      if (member?.id) return member;
    } catch { /* fall through */ }

    const { rows } = await this.listMembers({ currentPage: 1, pageSize: 10, search: String(id), filter: '' });
    const found = rows.find(m => String(m.id) === String(id)) || null;
    if (!found) throw new Error('Member not found');
    return found; // already Member instance
  }

  async getMemberByEmail(email) {
    if (!email) throw new Error('Missing member email');
    try {
      const raw = await this.connector.invoke('getMemberByEmail', email);
      const member = this.fromResponseToMember(raw);
      if (member && (member.emailAddress || member.id)) return member;
    } catch { /* fall through */ }

    const { rows } = await this.listMembers({ currentPage: 1, pageSize: 10, search: email, filter: '' });
    const lower = String(email).toLowerCase();
    const found = rows.find(m => (m.emailAddress || '').toLowerCase() === lower) || rows[0] || null;
    if (!found) throw new Error('Member not found');
    return found; // already Member instance
  }

  async getMemberForEditor({ id, email }) {
    if (id) return this.getMemberById(id);
    if (email) return this.getMemberByEmail(email);
    throw new Error('No member id or email provided.');
  }

  // Returns Member or null; never throws for "not found"
  async findMemberByEmail(email) {
    if (!email) return null;
    try {
      const m = await this.getMemberByEmail(email);
      return m || null;
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
        base = publicUrl.replace('/viewform?embedded=true', '/viewform').replace('/viewform?usp=sf_link', '/viewform');
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
    // Accept Member instance or plain object
    const obj = payload instanceof Member
      ? payload.toUpdateRequest({ registrationStatus: payload?.registration?.status || 'PENDING' })
      : (typeof payload === 'string' ? JSON.parse(payload) : { ...(payload || {}) });

    // Do not send contacts; let backend/Zoho sync
    delete obj.contacts;
    delete obj.primaryContactId;

    return this.withSpinner(async () => {
      const raw = await this.connector.invoke('addMemberRegistration', JSON.stringify(obj));
      const resp = this.toJson(raw) || {};
      const member = this.fromResponseToMember(resp);
      if (member) return { ...resp, member };
      // Fallback: refetch to pick up backend-side updates
      if (obj.emailAddress) {
        try { return { ...resp, member: await this.getMemberByEmail(obj.emailAddress) }; } catch {}
      }
      return resp;
    });
  }
}