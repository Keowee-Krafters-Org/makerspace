<template>
  <div class="overflow-x-auto bg-white border rounded">
    <table class="min-w-full text-sm border-collapse">
      <thead>
        <tr class="bg-gray-50 text-gray-700">
          <th class="px-3 py-2 text-left border">Title</th>
          <th class="px-3 py-2 text-left border">Start</th>
          <th class="px-3 py-2 text-left border">End</th>
          <th class="px-3 py-2 text-left border">Location</th>
          <th class="px-3 py-2 text-left border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <EventTableRow
          v-for="ev in events"
          :key="ev.id"
          :ev="ev"
          :member="member"
          :eventService="eventService"
          @select="$emit('select', ev)"
          @edit="$emit('edit', ev)"
          @delete="$emit('delete', ev)"
          @attendees="$emit('attendees', ev)"
          @refresh="$emit('refresh')"
        />
        <tr v-if="!events?.length">
          <td class="p-4 text-center text-gray-500 border" colspan="5">No events</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { inject } from 'vue';
import EventTableRow from '@/components/EventTableRow.vue';

export default {
  name: 'EventTableView',
  components: { EventTableRow },
  emits: ['refresh', 'add', 'select', 'delete', 'edit', 'prev', 'next', 'attendees'],
  props: {
    events: { type: Array, default: () => [] },
    page: { type: Object, default: () => ({ currentPage: 1, pageSize: 10, hasMore: false }) },
    loading: { type: Boolean, default: false },
    allowAdd: { type: Boolean, default: false },
  },
  setup() {
    const session = inject('session');
    const eventService = inject('eventService');
    return { session, eventService };
  },
  computed: {
    member() { return this.session?.member || null; },
  },
};
</script>