import { describe, it, expect } from 'vitest';
import { LineItem } from '@/model/LineItem';

describe('LineItem', () => {
  it('should instantiate a new line item object', () => {
    const lineItem = new LineItem();
    expect(lineItem).toBeInstanceOf(LineItem);
  });
});
