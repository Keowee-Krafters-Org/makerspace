import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TextInput from '@/components/TextInput.vue';

describe('TextInput.vue', () => {
  it('renders label and input', () => {
    const wrapper = mount(TextInput, {
      props: { id: 'test-input', label: 'Test Label' },
    });
    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe('Test Label');
    expect(label.attributes('for')).toBe('test-input');

    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('id')).toBe('test-input');
    expect(input.attributes('type')).toBe('text');
  });

  it('applies inputType prop', () => {
    const wrapper = mount(TextInput, {
      props: { id: 'password-input', label: 'Password', inputType: 'password' },
    });
    expect(wrapper.find('input').attributes('type')).toBe('password');
  });

  it('v-model updates value', async () => {
    const wrapper = mount(TextInput, {
      props: { id: 'username-input', label: 'Username', modelValue: 'initial value' },
    });
    const input = wrapper.find('input');
    expect(input.element.value).toBe('initial value');
    await input.setValue('new value');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value']);
  });

  it('sets required attribute when required=true', () => {
    const wrapper = mount(TextInput, {
      props: { id: 'required-input', label: 'Required Input', required: true },
    });
    expect(wrapper.find('input').attributes('required')).toBeDefined();
  });

  it('omits required attribute when required=false', () => {
    const wrapper = mount(TextInput, {
      props: { id: 'optional-input', label: 'Optional Input', required: false },
    });
    expect(wrapper.find('input').attributes('required')).toBeUndefined();
  });
});