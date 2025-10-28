<template>
  <div>
    <div class="flex items-center justify-end gap-2 mb-3">
      <!-- Icon-only Refresh -->
      <button
        type="button"
        class="p-2 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-50"
        @click="$emit('refresh')"
        :disabled="loading"
        aria-label="Refresh"
        title="Refresh"
      >
        <!-- refresh icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 6v3l4-4-4-4v3C7.58 4 4 7.58 4 12c0 1.57.46 3.03 1.26 4.26l1.49-1.49A5.98 5.98 0 0 1 6 12a6 6 0 0 1 6-6zm6.74 1.74-1.49 1.49A5.98 5.98 0 0 1 18 12a6 6 0 0 1-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.26-4.26z"/>
        </svg>
      </button>

      <!-- Icon-only Add -->
      <button
        v-if="allowAdd"
        type="button"
        class="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        @click="$emit('add')"
        :disabled="loading"
        aria-label="Add Event"
        title="Add Event"
      >
        <!-- plus icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>
        </svg>
      </button>
    </div>

    <EventTable
      :events="events"
      @select="$emit('select', $event)"
      @delete="$emit('delete', $event)"
      @edit="$emit('edit', $event)"
      @attendees="$emit('attendees', $event)"
    />

    <div class="flex items-center justify-center gap-4 mt-4">
      <Button label="Previous" @click="$emit('prev')" :disabled="page?.currentPage <= 1" />
      <span>Page {{ page?.currentPage || 1 }}</span>
      <Button label="Next" @click="$emit('next')" :disabled="!page?.hasMore" />
    </div>
  </div>
</template>

<script>
import EventTable from '@/components/EventTable.vue';
import Button from '@/components/Button.vue';

export default {
  name: 'EventTableView',
  components: { EventTable, Button },
  props: {
    events: { type: Array, default: () => [] },
    page: { type: Object, default: () => ({ currentPage: 1, hasMore: false }) },
    allowAdd: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  emits: ['select', 'delete', 'edit', 'prev', 'next', 'attendees', 'refresh', 'add'],
};
</script>