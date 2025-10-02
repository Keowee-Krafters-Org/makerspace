<template>
  <div>
    <EventList
      :events="events"
      @select="$emit('select', $event)"
      @delete="$emit('delete', $event)"
      @edit="$emit('edit', $event)"
    />
  </div>
</template>

<script>
import EventList from '@/components/EventList.vue';

export default {
  name: 'EventListView',
  components: { EventList },
  props: {
    events: { type: Array, required: true },
  },
};
</script>