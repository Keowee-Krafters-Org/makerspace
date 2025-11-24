import { mount } from '@vue/test-utils';
import LoginView from '@/views/login/LoginView.vue';

const mockSession = {
  member: {
    login: {
      status: 'UNVERIFIED', // Ensure the status matches the condition for rendering the button
    },
  },
};

const mockMemberPortal = {
  requestToken: jest.fn(),
  verifyCode: jest.fn(),
  resendToken: jest.fn(),
};

describe('LoginView.vue', () => {
  it('calls requestToken on button click', async () => {
    const wrapper = mount(LoginView, {
      global: {
        provide: {
          session: mockSession,
          memberPortal: mockMemberPortal,
        },
      },
    });

    // Set the email value
    await wrapper.setData({ email: 'test@example.com' });

    // Find the button by its text content
    const button = wrapper.find('button'); // Locate the button
    expect(button.text()).toBe('Verify Email'); // Ensure the button is rendered

    // Trigger the click event
    await button.trigger('click');

    // Assert that requestToken was called with the correct email
    expect(mockMemberPortal.requestToken).toHaveBeenCalledWith('test@example.com');
  });
});