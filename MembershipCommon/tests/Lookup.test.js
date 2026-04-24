import { describe, it, expect } from 'vitest';
import { Lookup } from '@/model/Lookup';

describe('Lookup', () => {
  it('should instantiate a new lookup object', () => {
    const lookup = new Lookup();
    expect(lookup).toBeInstanceOf(Lookup);
  });
});
