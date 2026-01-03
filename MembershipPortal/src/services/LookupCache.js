export class LookupCache {
  constructor({ ttlMs = 5 * 60 * 1000 } = {}) {
    this.ttlMs = ttlMs;
    this.store = new Map(); // key -> { value, expiresAt }
  }

  now() { return Date.now(); }

  isFresh(entry) {
    if (!entry) return false;
    if (entry.expiresAt == null) return true; // no TTL
    return this.now() < entry.expiresAt;
  }

  get(key, defaultValue = null) {
    const entry = this.store.get(String(key));
    return this.isFresh(entry) ? entry.value : defaultValue;
  }

  set(key, value, { ttlMs = this.ttlMs } = {}) {
    const expiresAt = (ttlMs && ttlMs > 0) ? (this.now() + ttlMs) : null;
    this.store.set(String(key), { value, expiresAt });
    return value;
  }

  invalidate(key) {
    this.store.delete(String(key));
  }

  clear() {
    this.store.clear();
  }

  async fetchOrGet(key, fetchFn, { ttlMs = this.ttlMs, force = false } = {}) {
    const k = String(key);
    const entry = this.store.get(k);
    if (!force && this.isFresh(entry)) return entry.value;
    const value = await Promise.resolve(fetchFn());
    this.set(k, value, { ttlMs });
    return value;
  }
}
