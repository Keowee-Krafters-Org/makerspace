import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Message from '@/components/Message.vue';

describe('Message.vue', () => {
  it('renders the message text correctly', () => {
    const wrapper = mount(Message, {
      props: { id: 'test-message', message: 'This is a test message.' },
    });
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
    expect(wrapper.classes()).toContain('bg-blue-100');
    expect(wrapper.classes()).toContain('text-blue-800');
  });

  it('emits click and calls onClick when clicked', async () => {
    const onClickMock = vi.fn();
    const wrapper = mount(Message, {
      props: {
        id: 'test-message',
        message: 'This is a test message.',
        onClick: onClickMock,
      },
    });
    await wrapper.trigger('click');
    expect(onClickMock).toHaveBeenCalled();
    // Also assert emission for dist test variant
    const emitted = wrapper.emitted('click');
    expect(emitted).toBeTruthy();
    expect(emitted?.length).toBeGreaterThan(0);
    expect(emitted?.[0]?.length).toBe(1); // event payload present
  });

  it('renders with default structural classes', () => {
    const wrapper = mount(Message, {
      props: { id: 'test-message', message: 'This is a test message.' },
    });
    expect(wrapper.classes()).toContain('p-4');
    expect(wrapper.classes()).toContain('rounded-lg');
    expect(wrapper.classes()).toContain('text-sm');
  });

  it('applies styles for "info" type', () => {
    const wrapper = mount(Message, { props: { id: 'info', message: 'Info.', type: 'info' } });
    expect(wrapper.classes()).toContain('bg-blue-100');
    expect(wrapper.classes()).toContain('text-blue-800');
    expect(wrapper.classes()).toContain('border-blue-300');
  });

  it('applies styles for "error" type', () => {
    const wrapper = mount(Message, { props: { id: 'error', message: 'Error.', type: 'error' } });
    expect(wrapper.classes()).toContain('bg-red-100');
    expect(wrapper.classes()).toContain('text-red-800');
    expect(wrapper.classes()).toContain('border-red-300');
  });

  it('applies styles for "warn" type', () => {
    const wrapper = mount(Message, { props: { id: 'warn', message: 'Warn.', type: 'warn' } });
    expect(wrapper.classes()).toContain('bg-yellow-100');
    expect(wrapper.classes()).toContain('text-yellow-800');
    expect(wrapper.classes()).toContain('border-yellow-300');
  });

  it('defaults to info styles when type omitted', () => {
    const wrapper = mount(Message, { props: { id: 'default', message: 'Default.' } });
    expect(wrapper.classes()).toContain('bg-blue-100');
    expect(wrapper.classes()).toContain('text-blue-800');
    expect(wrapper.classes()).toContain('border-blue-300');
  });
});