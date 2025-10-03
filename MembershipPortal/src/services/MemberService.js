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

  normalizeResponse(res) {
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
      requestToken: 'login',      // send sign-in link/code
      resendToken: 'login',       // resend uses same GAS login
      verifyCode:  'verifyToken', // verify code
      logout:      'logout',
    };
    return gasMap[name] || name;
  }

  // ---- Auth methods ----

  async requestToken(email) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('requestToken');
      // GAS: login(email) | Node: requestToken(email)
      const raw = await this.connector.invoke(fn, email);
      const resp = this.normalizeResponse(raw);
      // Typical GAS shape: { success, data: { ...member... } }
      return resp.data || resp.member || resp;
    });
  }

  async resendToken(email) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('resendToken');
      const raw = await this.connector.invoke(fn, email);
      const resp = this.normalizeResponse(raw);
      return resp.data || resp;
    });
  }

  async verifyCode(email, token) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('verifyCode');
      // GAS verifyToken(email, userToken); Node often expects an object
      const args = this.isGAS ? [email, token] : [{ email, token }];
      const raw = await this.connector.invoke(fn, ...args);
      const resp = this.normalizeResponse(raw);
      return resp.data || resp;
    });
  }

  async logout(email) {
    return this.withSpinner(async () => {
      const fn = this.mapFn('logout');
      const raw = await this.connector.invoke(fn, email);
      const resp = this.normalizeResponse(raw);
      // Best-effort local cleanup
      if (this.appService?.session) this.appService.session.member = null;
      return resp;
    });
  }

  // ---- Listing helpers (unchanged) ----
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

    return {
      rows: Array.isArray(list) ? list : [],
      page: { currentPage: page?.currentPage ?? callParams.currentPage, hasMore: hasMore ?? inferredHasMore, nextToken: nextToken || null },
      cursorMode,
    };
  }

  // ---- Member fetch helpers ----
  ensureMemberShape(data) {
    if (!data || typeof data !== 'object') return null;
    return {
      registration: { status: '', level: '', waiverSigned: false, waiverPdfLink: '' },
      ...data,
      registration: { status: '', level: '', waiverSigned: false, waiverPdfLink: '', ...(data.registration || {}) },
    };
  }

  async getMemberById(id) {
    if (!id) throw new Error('Missing member id');
    // Try dedicated GAS endpoint first
    try {
      const raw = await this.connector.invoke('getMemberById', id);
      const obj = this.normalizeResponse(raw);
      const data = obj?.data || obj;
      if (data?.id) return this.ensureMemberShape(data);
    } catch { /* not exposed; fall back */ }

    // Fallback via search + filter by id
    const { rows } = await this.listMembers({ currentPage: 1, pageSize: 10, search: String(id), filter: '' });
    const found = rows.find(m => String(m.id) === String(id)) || null;
    if (!found) throw new Error('Member not found');
    return this.ensureMemberShape(found);
  }

  async getMemberByEmail(email) {
    if (!email) throw new Error('Missing member email');
    // Try dedicated GAS endpoint first
    try {
      const raw = await this.connector.invoke('getMemberByEmail', email);
      const obj = this.normalizeResponse(raw);
      const data = obj?.data || obj;
      if (data?.emailAddress || data?.id) return this.ensureMemberShape(data);
    } catch { /* not exposed; fall back */ }

    // Fallback via search + filter by email
    const { rows } = await this.listMembers({ currentPage: 1, pageSize: 10, search: email, filter: '' });
    const lower = String(email).toLowerCase();
    const found = rows.find(m => (m.emailAddress || '').toLowerCase() === lower) || rows[0] || null;
    if (!found) throw new Error('Member not found');
    return this.ensureMemberShape(found);
  }

  // Optional thin wrapper for backward compat
  async getMemberForEditor({ id, email }) {
    if (id) return this.getMemberById(id);
    if (email) return this.getMemberByEmail(email);
    throw new Error('No member id or email provided.');
  }

  // Returns member or null; never throws for "not found"
  async findMemberByEmail(email) {
    if (!email) return null;
    try {
      const m = await this.getMemberByEmail(email);
      return m || null;
    } catch (e) {
      const msg = (e?.message || '').toLowerCase();
      // Suppress "not found" type errors; return null to indicate absence
      if (msg.includes('not found') || msg.includes('no member')) return null;
      // For any other unexpected error, log and return null to avoid blocking login
      return null;
    }
  }
}