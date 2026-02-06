<template>
  <EntityTable
    :loading="loading"
    :page="page"
    :allow-add="allowAdd"
    add-label="Add Event"
    :is-empty="!loading && events.length === 0"
    :columnCount="3"
    empty-message="No events"
    @add="$emit('add')"
    @request-page="$emit('request-page', $event)"
  >
    <template #header>
      <tr class="text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
        <th class="px-6 py-3 bg-gray-50">Title</th>
        <th class="px-6 py-3 bg-gray-50">Start</th>
        <th class="px-6 py-3 bg-gray-50">Actions</th>
      </tr>
    </template>
    <template #body>
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
    </template>
  </EntityTable>
</template>

<script>
import EntityTable from './EntityTable.vue';
import EventTableRow from './EventTableRow.vue';

export default {
  name: 'EventTable',
  components: { EntityTable, EventTableRow },
  props: {
    events: { type: Array, default: () => [] },
    page: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    allowAdd: { type: Boolean, default: false },
    member: { type: Object, default: null },
    eventService: { type: Object, required: true },
  },
  emits: ['add', 'request-page', 'select', 'edit', 'delete', 'attendees', 'refresh'],
};
</script>