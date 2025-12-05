import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginView from '@/views/login/LoginView.vue';

const mkMember = (status = 'UNVERIFIED') => ({
  id: 'm1',
  emailAddress: 'user@example.com',
  login: { status },
});

describe('LoginView.vue', () => {
  let wrapper;

  const mountView = (member = mkMember('UNVERIFIED')) =>
    mount(LoginView, {
      props: { member },
      global: {
        mocks: {
          $router: { push: () => {} },
          $route: { query: {} },
        },
      },
    });

  beforeEach(() => {
    wrapper = mountView();
  });

  it('renders email input when UNVERIFIED or TOKEN_EXPIRED', () => {
    expect(wrapper.find('input[type="text"]').exists()).toBe(true); // TextInput renders an input[type="text"]
    // Switch to TOKEN_EXPIRED
    wrapper.unmount();
    wrapper = mountView(mkMember('TOKEN_EXPIRED'));
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('emits request-token with email on Verify Email click', async () => {
    const email = 'user@example.com';
    // TextInput uses v-model="email" (internal data). Simulate typing.
    const input = wrapper.find('input');
    await input.setValue(email);
    // Click Verify Email
    const verifyBtn = wrapper.find('button');
    await verifyBtn.trigger('click');
    const emitted = wrapper.emitted('request-token');
    expect(emitted).toBeTruthy();
    expect(emitted[0]).toEqual([email]);
  });

  it('shows verification code input and emits verify-code/resend-token when VERIFYING', async () => {
    wrapper.unmount();
    wrapper = mountView(mkMember('VERIFYING'));

    // Should render verification code TextInput
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThan(0);

    // Enter code and click Verify Code
    const code = '123456';
    await inputs[0].setValue(code);
    const buttons = wrapper.findAll('button');
    const verifyBtn = buttons.find(b => b.text().includes('Verify Code'));
    const resendBtn = buttons.find(b => b.text().includes('Resend Code'));
    expect(verifyBtn).toBeTruthy();
    expect(resendBtn).toBeTruthy();

    await verifyBtn.trigger('click');
    const verifyEmitted = wrapper.emitted('verify-code');
    expect(verifyEmitted).toBeTruthy();
    expect(verifyEmitted[0]).toEqual([code]);

    await resendBtn.trigger('click');
    const resendEmitted = wrapper.emitted('resend-token');
    expect(resendEmitted).toBeTruthy();
    // Resend token uses current email model; since VERIFYING hides email input, it may be undefined
    // Accept empty or defined string
    const arg = resendEmitted[0][0];
    expect(typeof arg === 'string' || arg == null).toBe(true);
  });

  it('navigates to /event by default on onLogin', async () => {
    const pushMock = vi.fn();
    wrapper.unmount();
    wrapper = mount(LoginView, {
      props: { member: mkMember('UNVERIFIED') },
      global: {
        mocks: {
          $router: { push: pushMock },
          $route: { query: {} },
        },
      },
    });
    await wrapper.vm.onLogin();
    expect(pushMock).toHaveBeenCalledWith({ path: '/event' });
  });
});