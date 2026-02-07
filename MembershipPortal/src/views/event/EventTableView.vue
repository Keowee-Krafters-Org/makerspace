<template>
  <EventTable
    :events="events"
    :page="page"
    :loading="loading"
    :allow-add="allowAdd"
    :member="member"
    :eventService="eventService"
    @add="$emit('add')"
    @request-page="$emit('request-page', $event)"
    @select="$emit('select', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @attendees="$emit('attendees', $event)"
    @refresh="$emit('refresh')"
  />
</template>

<script>
import { inject } from 'vue';
import EventTable from '@/components/EventTable.vue';

export default {
  name: 'EventTableView',
  components: { EventTable },
  emits: ['refresh', 'add', 'select', 'delete', 'edit', 'request-page', 'attendees'],
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

