import { mount } from '@vue/test-utils';
import TextInput from '@/components/TextInput.vue';

describe('TextInput.vue', () => {
  it('renders the label and input correctly', () => {
    const wrapper = mount(TextInput, {
      props: {
        id: 'test-input',
        label: 'Test Label',
      },
    });

    // Check if the label is rendered
    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe('Test Label');
    expect(label.attributes('for')).toBe('test-input');

    // Check if the input is rendered
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('id')).toBe('test-input');
    expect(input.attributes('type')).toBe('text'); // Default type is 'text'
  });

  it('renders the input with the correct type', () => {
    const wrapper = mount(TextInput, {
      props: {
        id: 'password-input',
        label: 'Password',
        inputType: 'password',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('password');
  });

  it('binds the value using v-model', async () => {
    const wrapper = mount(TextInput, {
      props: {
        id: 'username-input',
        label: 'Username',
        modelValue: 'initial value',
      },
    });

    const input = wrapper.find('input');
    expect(input.element.value).toBe('initial value');

    // Simulate user input
    await input.setValue('new value');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new value']);
  });

  it('marks the input as required when the required prop is true', () => {
    const wrapper = mount(TextInput, {
      props: {
        id: 'required-input',
        label: 'Required Input',
        required: true,
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('required')).toBeDefined();
  });

  it('does not mark the input as required when the required prop is false', () => {
    const wrapper = mount(TextInput, {
      props: {
        id: 'optional-input',
        label: 'Optional Input',
        required: false,
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('required')).toBeUndefined();
  });
});