import { describe, it, expect } from 'vitest';
import { Event } from '@/model/Event';

describe('Event', () => {
  it('should instantiate a new event object', () => {
    const event = new Event();
    expect(event).toBeInstanceOf(Event);
  });
});
