import { describe, it, expect } from 'vitest';
import { Invoice } from '@/model/Invoice';

describe('Invoice', () => {
  it('should instantiate a new invoice object', () => {
    const invoice = new Invoice();
    expect(invoice).toBeInstanceOf(Invoice);
  });
});
