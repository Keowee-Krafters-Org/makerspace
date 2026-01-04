import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EventListView from '@/views/event/EventListView.vue';

describe('EventListView.vue', () => {
  it('renders Event cards and bubbles updated/refresh', async () => {
    const events = [{ id: 'e1', title: 'Test' }, { id: 'e2', title: 'Next' }];
    const wrapper = mount(EventListView, {
      props: { events, mode: 'list' },
      global: {
        stubs: {
          // Minimal stub that emits "updated" on click to simulate child refresh
          Event: {
            template: '<div class="event-stub" @click="$emit(\'updated\', { id })"></div>',
            props: ['id', 'initial', 'mode', 'variant'],
          },
        },
      },
    });

    // It should render two stubs
    expect(wrapper.findAll('.event-stub').length).toBe(events.length);

    // Simulate a child update
    await wrapper.find('.event-stub').trigger('click');

    // Assert bubbled events
    expect(wrapper.emitted('updated')).toBeTruthy();
    expect(wrapper.emitted('refresh')).toBeTruthy();
  });
});