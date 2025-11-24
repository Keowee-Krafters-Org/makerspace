import { mount } from '@vue/test-utils';
import Button from '@/components/Button.vue';

describe('Button.vue', () => {
  it('renders the button with the correct label', () => {
    const wrapper = mount(Button, {
      props: {
        id: 'test-button',
        label: 'Click Me',
      },
    });

    // Check if the button is rendered
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);

    // Check if the label is rendered correctly
    expect(button.text()).toBe('Click Me');
  });

  it('applies the correct default classes', () => {
    const wrapper = mount(Button, {
      props: {
        id: 'test-button',
        label: 'Click Me',
      },
    });

    // Check if the default classes are applied
    const button = wrapper.find('button');
    expect(button.classes()).toContain('px-4');
    expect(button.classes()).toContain('py-2');
    expect(button.classes()).toContain('font-semibold');
    expect(button.classes()).toContain('text-white');
    expect(button.classes()).toContain('rounded-md');
    expect(button.classes()).toContain('transition');
    expect(button.classes()).toContain('duration-200');
    expect(button.classes()).toContain('bg-gray-300'); // Default type
    expect(button.classes()).toContain('hover:bg-gray-400');
  });

  it('applies the correct classes for "save" type', () => {
    const wrapper = mount(Button, {
      props: {
        id: 'save-button',
        label: 'Save',
        type: 'save',
      },
    });

    const button = wrapper.find('button');
    expect(button.classes()).toContain('bg-green-500');
    expect(button.classes()).toContain('hover:bg-green-600');
    expect(button.classes()).toContain('focus:ring-2');
    expect(button.classes()).toContain('focus:ring-green-300');
  });

  it('applies the correct classes for "cancel" type', () => {
    const wrapper = mount(Button, {
      props: {
        id: 'cancel-button',
        label: 'Cancel',
        type: 'cancel',
      },
    });

    const button = wrapper.find('button');
    expect(button.classes()).toContain('bg-red-500');
    expect(button.classes()).toContain('hover:bg-red-600');
    expect(button.classes()).toContain('focus:ring-2');
    expect(button.classes()).toContain('focus:ring-red-300');
  });

  it('applies the correct classes for "next" type', () => {
    const wrapper = mount(Button, {
      props: {
        id: 'next-button',
        label: 'Next',
        type: 'next',
      },
    });

    const button = wrapper.find('button');
    expect(button.classes()).toContain('bg-blue-500');
    expect(button.classes()).toContain('hover:bg-blue-600');
    expect(button.classes()).toContain('focus:ring-2');
    expect(button.classes()).toContain('focus:ring-blue-300');
  });

  it('applies the correct classes for "back" type', () => {
    const wrapper = mount(Button, {
      props: {
        id: 'back-button',
        label: 'Back',
        type: 'back',
      },
    });

    const button = wrapper.find('button');
    expect(button.classes()).toContain('bg-gray-500');
    expect(button.classes()).toContain('hover:bg-gray-600');
    expect(button.classes()).toContain('focus:ring-2');
    expect(button.classes()).toContain('focus:ring-gray-300');
  });

  it('allows additional custom classes via classname prop', () => {
    const wrapper = mount(Button, {
      props: {
        id: 'custom-button',
        label: 'Custom',
        classname: 'bg-purple-500 hover:bg-purple-600',
      },
    });

    const button = wrapper.find('button');
    expect(button.classes()).toContain('bg-purple-500');
    expect(button.classes()).toContain('hover:bg-purple-600');
  });
});