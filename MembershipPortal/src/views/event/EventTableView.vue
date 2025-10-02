<template>
  <div>
    <EventTable
      :events="events"
      @select="$emit('select', $event)"
      @delete="$emit('delete', $event)"
      @edit="$emit('edit', $event)"
    />
  </div>
</template>

<script>
import EventTable from '@/components/EventTable.vue';

export default {
  name: 'EventTableView',
  components: { EventTable },
  props: {
    events: { type: Array, required: true },
  },
};
</script>