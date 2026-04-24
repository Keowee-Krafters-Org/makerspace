import { describe, it, expect } from 'vitest';
import { Login } from '@/model/Login';

describe('Login', () => {
  it('should instantiate a new login object', () => {
    const login = new Login();
    expect(login).toBeInstanceOf(Login);
  });
});
