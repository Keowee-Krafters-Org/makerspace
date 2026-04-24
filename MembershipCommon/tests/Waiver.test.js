import { describe, it, expect } from 'vitest';
import { Waiver } from '@/model/Waiver';

describe('Waiver', () => {
  it('should instantiate a new waiver object', () => {
    const waiver = new Waiver();
    expect(waiver).toBeInstanceOf(Waiver);
  });
});
