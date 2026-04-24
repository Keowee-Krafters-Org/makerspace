import { describe, it, expect } from 'vitest';
import { Form } from '@/model/Form';

describe('Form', () => {
  it('should instantiate a new form object', () => {
    const form = new Form();
    expect(form).toBeInstanceOf(Form);
  });
});
