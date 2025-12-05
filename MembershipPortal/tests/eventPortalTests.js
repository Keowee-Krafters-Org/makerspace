import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventService } from '../src/services/EventService.js';

describe('EventService', () => {
  let svc, connector, appService;

  beforeEach(() => {
    connector = { invoke: vi.fn() };
    appService = { withSpinner: (fn) => fn() };
    svc = new EventService(connector, appService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('listEvents unwraps data when success wrapper present', async () => {
    connector.invoke.mockResolvedValue({ success: true, data: [{ id: 'e1' }] });
    const rows = await svc.listEvents();
    expect(rows).toEqual([{ id: 'e1' }]);
  });

  it('signup returns success and message', async () => {
    connector.invoke.mockResolvedValue({ success: true, data: { message: 'ok' } });
    const res = await svc.signup('e1', 'm1');
    expect(res.success).toBe(true);
    expect(res.message).toBe('ok');
  });
});