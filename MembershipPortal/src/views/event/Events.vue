<template>
  <div class="events-view">
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Events</h2>
      <div class="flex items-center gap-2">
        <Button icon="list" label="List" @click="viewMode = 'list'" :disabled="viewMode === 'list' || loading" />
        <Button
          v-if="isTableAllowed"
          icon="table"
          label="Table"
          @click="viewMode = 'table'"
          :disabled="viewMode === 'table' || loading"
        />
        <!-- Show a header refresh only in list mode to avoid duplicate with table toolbar -->
        <button
          v-if="viewMode === 'list'"
          type="button"
          class="p-2 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-50"
          @click="onRefresh"
          :disabled="loading"
          aria-label="Refresh"
          title="Refresh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 6v3l4-4-4-4v3C7.58 4 4 7.58 4 12c0 1.57.46 3.03 1.26 4.26l1.49-1.49A5.98 5.98 0 0 1 6 12a6 6 0 0 1 6-6zm6.74 1.74-1.49 1.49A5.98 5.98 0 0 1 18 12a6 6 0 0 1-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.26-4.26z"/>
          </svg>
        </button>
      </div>
    </header>

    <Message v-if="error" type="error" :message="error" class="mb-4" />

    <EventListView
      v-if="viewMode === 'list'"
      :events="events"
      :mode="viewMode"
      @select="handleSelect"
      @delete="handleDelete"
      @edit="handleEdit"
    />

    <!-- Guard table view by permission -->
    <EventTableView
      v-else-if="viewMode === 'table' && isTableAllowed"
      :events="events"
      :page="page"
      :allowAdd="isTableAllowed"
      :loading="loading"
      @refresh="onRefresh"
      @add="addEvent"
      @select="handleSelect"
      @delete="handleDelete"
      @edit="handleEdit"
      @prev="prevPage"
      @next="nextPage"
      @attendees="openAttendees"
    />
    <!-- If somehow in table mode but not allowed, silently show list instead -->
    <EventListView
      v-else
      :events="events"
      :mode="'list'"
      @select="handleSelect"
      @delete="handleDelete"
      @edit="handleEdit"
    />
  </div>
</template>

<script>
import { inject } from 'vue';
import Button from '@/components/Button.vue';
import Message from '@/components/Message.vue';
import EventListView from './EventListView.vue';
import EventTableView from './EventTableView.vue';

export default {
  name: 'Events',
  components: { Button, Message, EventListView, EventTableView },
  data() {
    return {
      events: [],
      error: '',
      page: { currentPage: 1, pageSize: 10, hasMore: false },
      viewMode: this.$route.query.mode === 'table' ? 'table' : 'list',
      loading: false, // NEW: track loading for UI/child
    };
  },
  created() {
    this.appService = inject('appService');
    this.logger = inject('logger');
    this.session = inject('session');
    this.eventService = inject('eventService');

    if (this.session && !this.$route.query.mode) {
      this.viewMode = this.session.viewMode || this.viewMode;
    }

    // Enforce permissions on initial load
    this.enforceModePermissions(true);

    this.loadEvents();
  },
  watch: {
    viewMode(newMode) {
      if (this.session) this.session.viewMode = newMode;
      // Keep URL in sync
      this.$router.replace({ path: '/event', query: { mode: newMode } });
      // If user switched to table but is not allowed, bounce to list
      this.enforceModePermissions();
    },
  },
  computed: {
    member() {
      return this.session?.member || null;
    },
    isMemberRegisteredLogin() {
      const status = (this.member?.login?.status || '').toString().toUpperCase();
      // Not allowed if explicitly UNREGISTERED or EXPIRED
      return status && status !== 'UNREGISTERED' && status !== 'EXPIRED';
    },
    memberLevel() {
      return (
        this.member?.registration?.level ||
        this.member?.level ||
        this.member?.role ||
        ''
      );
    },
    isTableAllowed() {
      const hostRank = this.getLevelValue('Host');
      const userRank = this.getLevelValue(this.memberLevel);
      return !!this.member && this.isMemberRegisteredLogin && userRank > hostRank;
    },
  },
  methods: {
    async loadEvents() {
      this.error = '';
      this.loading = true;
      try {
        const res = await this.eventService.listEvents({
          currentPage: this.page.currentPage,
          pageSize: this.page.pageSize,
        });
        if (Array.isArray(res)) {
          this.events = res;
          this.page.hasMore = res.length >= this.page.pageSize;
        } else if (res && typeof res === 'object') {
          this.events = res.data ?? [];
          this.page.hasMore = !!res.page?.hasMore || this.events.length >= this.page.pageSize;
          if (res.page?.currentPage) this.page.currentPage = res.page.currentPage;
        } else {
          this.events = [];
          this.page.hasMore = false;
        }
      } catch (e) {
        this.error = e?.message || 'Failed to load events';
        this.logger?.error?.('loadEvents failed', e);
      } finally {
        this.loading = false;
      }
    },
    onRefresh() {
      this.loadEvents();
    },
    addEvent() {
      // Always use the explicit "new" route
      this.$router.push({ name: 'EventEditorNew', query: { mode: this.viewMode } });
    },
    prevPage() {
      if (this.page.currentPage > 1) {
        this.page.currentPage -= 1;
        this.loadEvents();
      }
    },
    nextPage() {
      if (this.page.hasMore) {
        this.page.currentPage += 1;
        this.loadEvents();
      }
    },
    handleSelect(ev) {
      this.$router.push({ name: 'EventView', query: { id: ev?.id, mode: this.viewMode } });
    },
    async handleDelete(ev) {
      try {
        await this.eventService.deleteEvent(ev.id);
        await this.loadEvents();
      } catch (e) {
        this.error = e?.message || 'Failed to delete event';
      }
    },
    handleEdit(ev) {
      this.$router.push({
        name: 'EventEditor',
        params: { id: String(ev?.id || '') },
        query: { mode: this.viewMode },
      });
    },
    openAttendees(ev) {
      this.$router.push({ path: '/event/attendees', query: { id: ev.id, mode: this.viewMode } });
    },
    enforceModePermissions(initial = false) {
      // If user is not allowed to view table, force list and fix URL
      if (this.viewMode === 'table' && !this.isTableAllowed) {
        this.viewMode = 'list';
        // Avoid extra replace at very first created() when we might not have had a query
        this.$router.replace({ path: '/event', query: { mode: 'list' } });
      } else if (initial && !this.$route.query.mode) {
        // Ensure URL has mode on first load
        this.$router.replace({ path: '/event', query: { mode: this.viewMode } });
      }
    },
    getLevelValue(name) {
      const levels = this.appService?.config?.levels || {};
      if (!name) return Number.NEGATIVE_INFINITY;
      const norm = String(name).trim().toLowerCase();
      for (const [key, val] of Object.entries(levels)) {
        if (key.trim().toLowerCase() === norm) {
          return typeof val?.value === 'number' ? val.value : Number.NEGATIVE_INFINITY;
        }
      }
      return Number.NEGATIVE_INFINITY;
    },
  },
};
</script>

<style scoped>
.events-view { padding: 1rem; }
</style>