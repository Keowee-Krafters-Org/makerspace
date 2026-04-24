import { describe, it, expect } from 'vitest';
import { Instructor } from '@/model/Instructor';

describe('Instructor', () => {
  it('should instantiate a new instructor object', () => {
    const instructor = new Instructor();
    expect(instructor).toBeInstanceOf(Instructor);
  });
});
