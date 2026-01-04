import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import DropdownList from '../../src/components/DropdownList.vue';

describe('DropdownList.vue', () => {
  const items = [
    { id: 1, title: 'One' },
    { id: '2', name: 'Two' },
    { value: '3', fullName: 'Three' },
  ];

  it('renders empty option and items with normalized ids/labels', () => {
    const wrapper = mount(DropdownList, {
      props: { listItems: items, emptyMessage: 'Select an option' },
    });

    const options = wrapper.findAll('option');
    expect(options.length).toBe(1 + items.length);

    // Empty option
    expect(options[0].element.value).toBe('');
    expect(options[0].text()).toBe('Select an option');

    // Item options (ids normalized to strings)
    expect(options[1].element.value).toBe('1');
    expect(options[1].text()).toBe('One');

    expect(options[2].element.value).toBe('2');
    expect(options[2].text()).toBe('Two');

    expect(options[3].element.value).toBe('3');
    expect(options[3].text()).toBe('Three');
  });

  it('respects v-model (modelValue) and updates on change', async () => {
    const wrapper = mount(DropdownList, {
      props: {
        listItems: items,
        modelValue: '2',
        emptyMessage: 'Select',
      },
    });

    const select = wrapper.find('select');
    expect(select.element.value).toBe('2');

    // Change selection to id "1"
    await select.setValue('1');

    const updates = wrapper.emitted('update:modelValue');
    const changes = wrapper.emitted('change');
    expect(updates).toBeTruthy();
    expect(changes).toBeTruthy();
    expect(updates[0]).toEqual(['1']);
    expect(changes[0]).toEqual(['1']);
  });

  it('accepts numeric modelValue and normalizes to string', async () => {
    const wrapper = mount(DropdownList, {
      props: {
        listItems: items,
        modelValue: 1, // numeric
        emptyMessage: 'Select',
      },
    });
    const select = wrapper.find('select');
    expect(select.element.value).toBe('1');
  });

  it('shows "No items available" when list is empty', () => {
    const wrapper = mount(DropdownList, {
      props: { listItems: [], emptyMessage: 'Select' },
    });
    expect(wrapper.text()).toContain('No items available');
  });

  it('clears selection if current value no longer exists when listItems change', async () => {
    const wrapper = mount(DropdownList, {
      props: {
        listItems: items,
        modelValue: '2',
        emptyMessage: 'Select',
      },
    });

    // Replace list with an item that doesn't include id "2"
    await wrapper.setProps({ listItems: [{ id: '9', title: 'Nine' }] });
    await nextTick();

    const select = wrapper.find('select');
    expect(select.element.value).toBe(''); // reset to empty
    const updates = wrapper.emitted('update:modelValue');
    expect(updates?.some(args => args[0] === '')).toBe(true);
  });

  it('supports custom labelKeys and idKey', () => {
    const customItems = [
      { key: 'a1', label: 'Alpha' },
      { key: 'b2', label: 'Beta' },
    ];
    const wrapper = mount(DropdownList, {
      props: {
        listItems: customItems,
        idKey: 'key',
        labelKeys: ['label', 'name'],
        emptyMessage: 'Select',
      },
    });
    const options = wrapper.findAll('option');
    expect(options[1].element.value).toBe('a1');
    expect(options[1].text()).toBe('Alpha');
    expect(options[2].element.value).toBe('b2');
    expect(options[2].text()).toBe('Beta');
  });
});