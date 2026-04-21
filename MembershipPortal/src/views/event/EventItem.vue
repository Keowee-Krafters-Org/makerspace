<template>
  <div class="event-item-view">
    <div v-if="eventItem" class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">{{ eventItem.name }}</h1>
      <p class="mb-4">{{ eventItem.description }}</p>
      
      <div v-if="upcomingEvents.length > 0">
        <h2 class="text-xl font-semibold mb-2">Upcoming Dates</h2>
        <ul>
          <li v-for="event in upcomingEvents" :key="event.id" class="mb-2">
            {{ new Date(event.start).toLocaleString() }} - {{ new Date(event.end).toLocaleString() }}
          </li>
        </ul>
      </div>
      <div v-else>
        <p>There are no upcoming dates for this event. Please check back later.</p>
      </div>
    </div>
    <div v-else-if="loading" class="text-center p-8">
      <p>Loading event details...</p>
    </div>
    <div v-else-if="error" class="text-center p-8 text-red-500">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue';

export default {
  name: 'EventItem',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const eventService = inject('eventService');
    const logger = inject('logger');
    return { eventService, logger };
  },
  data() {
    return {
      eventItem: null,
      upcomingEvents: [],
      loading: false,
      error: null,
    };
  },
  async created() {
    this.loading = true;
    try {
      const result = await this.eventService.getEventsByEventItemId(this.id);
      if (result && result.eventItem) {
        this.eventItem = result.eventItem;
        this.upcomingEvents = result.events.filter(e => new Date(e.start) > new Date());
      } else {
        this.error = 'Event not found.';
      }
    } catch (e) {
      this.logger?.error?.('Failed to load event item', e);
      this.error = 'Failed to load event details. Please try again later.';
    } finally {
      this.loading = false;
    }
  },
};
</script>
