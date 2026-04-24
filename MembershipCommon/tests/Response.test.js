import { describe, it, expect } from 'vitest';
import { Response } from '@/model/Response';

describe('Response', () => {
  it('should instantiate a new response object', () => {
    const response = new Response();
    expect(response).toBeInstanceOf(Response);
  });
});
