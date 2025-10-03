<template>
  <div>
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
  },
  emits: ['select', 'delete', 'edit', 'prev', 'next', 'attendees'],
};
</script>