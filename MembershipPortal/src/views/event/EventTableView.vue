<template>
  <div class="panel">
    <div class="toolbar">
      <div class="text-muted">
        Page: {{ page?.currentPageMarker || '1' }} • Size: {{ page?.pageSize || 0 }}
      </div>
      <div class="toolbar-actions">
        <button
          type="button"
          class="btn btn-icon"
          :disabled="loading || !allowAdd"
          @click="$emit('add')"
        >
          <Icon name="pencil" :size="18" />
          <span class="leading-none">Add Event</span>
        </button>

        <button
          type="button"
          class="pager-btn"
          :disabled="loading || !page?.previousPageMarker"
          @click="$emit('prev')"
        >
          Previous
        </button>
        <button
          type="button"
          class="pager-btn"
          :disabled="loading || !(page?.nextPageMarker || page?.pageToken)"
          @click="$emit('next')"
        >
          Next
        </button>
      </div>
    </div>

    <table class="table-base">
      <thead class="table-head">
        <tr>
          <th class="th">Title</th>
          <th class="th">Start</th>
          <th class="th">End</th>
          <th class="th">Location</th>
          <th class="th">Actions</th>
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
          <td class="table-empty" colspan="5">No events</td>
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

<style scoped>
.panel {
  overflow-x: auto;
  background-color: white;
  border-radius: 0.375rem;
  border-width: 1px;
  border-color: #e5e7eb;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
  background-color: #f9fafb;
}

.text-muted {
  color: #6b7280;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.2s;
}

.btn-icon {
  padding: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: #f3f4f6;
  color: #111827;
  transition: background-color 0.2s;
}

.pager-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-base {
  width: 100%;
  border-collapse: collapse;
}

.table-head {
  background-color: #f3f4f6;
  color: #111827;
}

.th {
  padding: 0.75rem;
  text-align: left;
  border-bottom-width: 2px;
  border-bottom-color: #e5e7eb;
}

.table-empty {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  border-top-width: 2px;
  border-top-color: #e5e7eb;
}
</style>