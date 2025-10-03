<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <Event
      v-for="ev in events"
      :key="ev.id"
      :id="ev.id"
      :initial="ev"
      :mode="mode"
      variant="card"
    />
  </div>
</template>

<script>
import Event from '@/views/event/Event.vue';

export default {
  name: 'EventListView',
  components: { Event },
  props: {
    events: { type: Array, default: () => [] },
    mode: { type: String, default: 'list' },
  },
};
</script>