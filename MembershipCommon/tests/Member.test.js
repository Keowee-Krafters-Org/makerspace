import { describe, it, expect } from 'vitest';
import { Member } from '@/model/Member';

describe('Member', () => {
  it('should instantiate a new member object', () => {
    const member = new Member();
    expect(member).toBeInstanceOf(Member);
  });
});
