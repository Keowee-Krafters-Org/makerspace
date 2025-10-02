<template>
  <div class="events-view">
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Events</h2>
      <div class="flex gap-2">
        <Button label="List" @click="viewMode = 'list'" :disabled="viewMode === 'list'" />
        <Button label="Table" @click="viewMode = 'table'" :disabled="viewMode === 'table'" />
        <Button label="Refresh" @click="loadEvents" :disabled="loading" />
      </div>
    </header>

    <Message v-if="error" type="error" :message="error" class="mb-4" />
    <Spinner v-if="loading" />

    <EventListView
      v-else-if="viewMode === 'list'"
      :events="events"
      @select="handleSelect"
      @delete="handleDelete"
      @edit="handleEdit"
    />

    <EventTableView
      v-else
      :events="events"
      @select="handleSelect"
      @delete="handleDelete"
      @edit="handleEdit"
    />
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import Message from '@/components/Message.vue';
import Spinner from '@/components/Spinner.vue';
import EventListView from './EventListView.vue';
import EventTableView from './EventTableView.vue';

export default {
  name: 'Events',
  components: { Button, Message, Spinner, EventListView, EventTableView },
  inject: ['logger', 'session', 'eventService'],
  data() {
    const modeFromQuery = this.$route.query.mode === 'table' ? 'table' : (this.$route.query.mode === 'list' ? 'list' : null);
    return {
      loading: true,
      error: '',
      events: [],
      viewMode: modeFromQuery || (this.session.viewMode === 'table' ? 'table' : 'list'),
    };
  },
  async created() {
    await this.loadEvents();
  },
  methods: {
    async loadEvents() {
      this.loading = true;
      this.error = '';
      try {
        this.events = await this.eventService.listEvents();
      } catch (e) {
        this.error = e?.message || 'Failed to load events';
        this.logger?.error?.('loadEvents failed', e);
      } finally {
        this.loading = false;
      }
    },
    handleSelect(event) {
      this.logger?.info?.('Selected event', event?.id);
      // navigate or set selected id in session if needed
    },
    async handleDelete(event) {
      try {
        await this.eventService.deleteEvent(event.id);
        this.events = this.events.filter(e => e.id !== event.id);
      } catch (e) {
        this.error = e?.message || 'Failed to delete event';
      }
    },
    handleEdit(event) {
      this.logger?.info?.('Edit event', event?.id);
      // route to editor if needed
    },
  },
};
</script>

<style scoped>
.events-view { padding: 1rem; }
</style>