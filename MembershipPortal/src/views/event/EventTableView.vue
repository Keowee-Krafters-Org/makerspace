<template>
  <div class="overflow-x-auto bg-white border rounded">
    <!-- Add Event button -->
    <div class="flex items-center justify-end p-2 border-b bg-gray-50">
      <button
        type="button"
        class="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        :disabled="loading || !allowAdd"
        @click="$emit('add')"
      >
        Add Event
      </button>
    </div>

    <table class="min-w-full text-sm border-collapse">
      <thead>
        <tr class="bg-gray-50 text-gray-700">
          <th class="px-3 py-2 text-left border">Title</th>
          <th class="px-3 py-2 text-left border">Start</th>
          <th class="px-3 py-2 text-left border">Duration</th>
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