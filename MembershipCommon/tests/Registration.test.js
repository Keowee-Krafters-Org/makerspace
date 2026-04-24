import { describe, it, expect } from 'vitest';
import { Registration } from '@/model/Registration';

describe('Registration', () => {
  it('should instantiate a new registration object', () => {
    const registration = new Registration();
    expect(registration).toBeInstanceOf(Registration);
  });
});
