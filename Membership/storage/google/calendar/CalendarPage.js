

/**
 * CalendarPage
 * Normalized pagination model for Google Calendar-backed storage.
 * Google Calendar does not use numeric pages; it uses nextPageToken strings.
 * We map tokens into the common markers:
 * - currentPageMarker: string token for current page (or "1" for initial)
 * - nextPageMarker: next page token (string or null)
 * - previousPageMarker: not supported by Calendar API (null)
 * - pageSize: maxResults
 * - hasMore: Boolean(nextPageToken)
 */
 class CalendarPage extends Page {
  constructor(data = {}) {
    super({
      currentPageMarker: data.currentPageMarker ?? (data.pageToken ?? '1'),
      pageSize: data.pageSize ?? (data.maxResults ?? 50),
      // hasMore will be derived; ignore incoming hasMore here
    });
    // Track the calendar token
    this.nextPageMarker = data.nextPageMarker ?? data.nextPageToken ?? null;
  }

  // Common markers based on Calendar semantics
  get currentPageMarker() { return String(this._currentPage); }
  set currentPageMarker(v) { this._currentPage = isNaN(Number(v)) ? String(v || '1') : Number(v); }

  get pageSize() { return this._pageSize; }
  set pageSize(v) { this._pageSize = parseInt(v || 50, 10); }

  // Derive hasMore from the token (next page available if a token exists)
  get hasMore() {
    return this.pageToken != null && this.pageToken !== '';
  }
  set hasMore(v) {
    // Optional: allow manual override by setting/removing token
    if (!v) this.pageToken = null;
  }

  // Calendar doesn’t provide previous; keep null
  get previousPageMarker() { return null; }
  set previousPageMarker(v) { /* noop (unsupported) */ }

  // For Calendar, nextPageMarker is the nextPageToken string
  get nextPageMarker() { return this.pageToken || null; }
  set nextPageMarker(v) {
    this.pageToken = v == null || v === '' ? null : String(v);
  }

  // Transport mapping (request params)
  static getToRecordMap() {
    return {
      currentPageMarker: 'pageToken',   // we pass the current token to get the next page
      pageSize: 'maxResults',
      hasMore: 'hasMore',               // not used in requests, included for completeness
    };
  }

  /**
   * Build CalendarPage from a Calendar API response and the params used.
   * response: { nextPageToken?: string }
   * params:   { pageToken?: string, maxResults?: number }
   */
  static fromRecord(response = {}, sentParams = {}) {
    const nextToken = response.getNextPageToken ?? null;
    const currToken = sentParams.pageToken ?? sentParams.currentPageMarker ?? '1';
    const size = sentParams.maxResults ?? sentParams.pageSize ?? 50;

    return new CalendarPage({
      currentPageMarker: currToken,
      nextPageMarker: nextToken,
      pageSize: size,
      // hasMore derived from token; no need to pass
    });
  }

  /**
   * Emit Calendar request params from normalized state.
   * Only pageToken and maxResults are relevant for requests.
   */
  toRecord() {
    return {
      pageToken: this.currentPageMarker === '1' || typeof this.currentPageMarker === 'number'
        ? undefined // initial page: omit token
        : String(this.currentPageMarker),
      maxResults: this.pageSize,
    };
  }

  toObject() {
    return {
      currentPageMarker: this.currentPageMarker,
      nextPageMarker: this.nextPageMarker,
      previousPageMarker: this.previousPageMarker,
      pageSize: this.pageSize,
      hasMore: this.hasMore,
      // compatibility token
      pageToken: this.pageToken || null,
    };
  }
}