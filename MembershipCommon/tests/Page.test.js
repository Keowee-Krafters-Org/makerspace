import { describe, it, expect } from 'vitest';
import { Page } from '@/model/Page';

describe('Page', () => {
  it('should instantiate a new page object', () => {
    const page = new Page();
    expect(page).toBeInstanceOf(Page);
  });
});
