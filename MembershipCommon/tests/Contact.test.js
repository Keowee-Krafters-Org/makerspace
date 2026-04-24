import { describe, it, expect } from 'vitest';
import { Contact } from '@/model/Contact';

describe('Contact', () => {
  it('should instantiate a new contact object', () => {
    const contact = new Contact();
    expect(contact).toBeInstanceOf(Contact);
  });
});
