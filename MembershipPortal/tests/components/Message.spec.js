import { mount } from '@vue/test-utils';
import Message from '@/components/Message.vue';

describe('Message.vue', () => {
  it('renders the message text correctly', () => {
    const wrapper = mount(Message, {
      props: {
        id: 'test-message',
        message: 'This is a test message.',
      },
    });

    // Check if the message text is rendered
    expect(wrapper.text()).toBe('This is a test message.');
  });

  it('applies the correct class name', () => {
    const wrapper = mount(Message, {
      props: {
        id: 'test-message',
        message: 'This is a test message.',
        className: 'bg-blue-100 text-blue-800',
      },
    });

    // Check if the class name is applied
    expect(wrapper.classes()).toContain('bg-blue-100');
    expect(wrapper.classes()).toContain('text-blue-800');
  });

  it('emits an event when clicked', async () => {
    const onClickMock = jest.fn();
    const wrapper = mount(Message, {
      props: {
        id: 'test-message',
        message: 'This is a test message.',
        onClick: onClickMock,
      },
    });

    // Simulate a click event
    await wrapper.trigger('click');

    // Check if the onClick function was called
    expect(onClickMock).toHaveBeenCalled();
  });

  it('renders with default class if no className is provided', () => {
    const wrapper = mount(Message, {
      props: {
        id: 'test-message',
        message: 'This is a test message.',
      },
    });

    // Check if the default class is applied
    expect(wrapper.classes()).toContain('p-4');
    expect(wrapper.classes()).toContain('rounded-lg');
    expect(wrapper.classes()).toContain('text-sm');
  });

  it('applies the correct styles for "info" type', () => {
    const wrapper = mount(Message, {
      props: {
        id: 'info-message',
        message: 'This is an info message.',
        type: 'info',
      },
    });

    // Check if the info styles are applied
    expect(wrapper.classes()).toContain('bg-blue-100');
    expect(wrapper.classes()).toContain('text-blue-800');
    expect(wrapper.classes()).toContain('border-blue-300');
  });

  it('applies the correct styles for "error" type', () => {
    const wrapper = mount(Message, {
      props: {
        id: 'error-message',
        message: 'This is an error message.',
        type: 'error',
      },
    });

    // Check if the error styles are applied
    expect(wrapper.classes()).toContain('bg-red-100');
    expect(wrapper.classes()).toContain('text-red-800');
    expect(wrapper.classes()).toContain('border-red-300');
  });

  it('applies the correct styles for "warn" type', () => {
    const wrapper = mount(Message, {
      props: {
        id: 'warn-message',
        message: 'This is a warning message.',
        type: 'warn',
      },
    });

    // Check if the warning styles are applied
    expect(wrapper.classes()).toContain('bg-yellow-100');
    expect(wrapper.classes()).toContain('text-yellow-800');
    expect(wrapper.classes()).toContain('border-yellow-300');
  });

  it('defaults to "info" type if no type is provided', () => {
    const wrapper = mount(Message, {
      props: {
        id: 'default-message',
        message: 'This is a default message.',
      },
    });

    // Check if the default info styles are applied
    expect(wrapper.classes()).toContain('bg-blue-100');
    expect(wrapper.classes()).toContain('text-blue-800');
    expect(wrapper.classes()).toContain('border-blue-300');
  });
});