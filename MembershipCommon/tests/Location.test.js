import { describe, it, expect } from 'vitest';
import { Location } from '@/model/Location';

describe('Location', () => {
  it('should instantiate a new location object', () => {
    const location = new Location();
    expect(location).toBeInstanceOf(Location);
  });
});
