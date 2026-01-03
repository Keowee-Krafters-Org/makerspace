<template>
  <div class="panel p-4">
    <header class="toolbar">
      <h3 class="text-xl font-semibold">Attendees</h3>
      <div class="toolbar-actions">
        <Button label="Back" @click="$router.back()" />
      </div>
    </header>

    <Message v-if="error" type="error" :message="error" class="mb-3" />

    <table class="table-base">
      <thead>
        <tr class="table-head">
          <th class="th">Name</th>
          <th class="th">Email</th>
          <th class="th">Phone</th>
          <th class="th">Outstanding Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in attendees" :key="a.id || a.emailAddress">
          <td class="td">{{ [a.firstName, a.lastName].filter(Boolean).join(' ') || 'N/A' }}</td>
          <td class="td">{{ a.emailAddress || 'N/A' }}</td>
          <td class="td">{{ a.phoneNumber || 'N/A' }}</td>
          <td class="td">
            {{ a.outstandingBalance ? `$${Number(a.outstandingBalance).toFixed(2)}` : '$0.00' }}
          </td>
        </tr>
        <tr v-if="!attendees.length">
          <td class="table-empty" colspan="4">No attendees for this event.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { inject } from 'vue';
import Button from '@/components/Button.vue';
import Message from '@/components/Message.vue';

export default {
  name: 'EventAttendees',
  components: { Button, Message },
  data() {
    return {
      attendees: [],
      error: '',
    };
  },
  async created() {
    const eventService = inject('eventService');
    const logger = inject('logger');
    const eventId = this.$route.query.id;
    if (!eventId) {
      this.error = 'Missing event id';
      return;
    }
    try {
      this.attendees = await eventService.getEventAttendees(eventId);
    } catch (e) {
      this.error = e?.message || 'Failed to load attendees';
      logger?.error?.('getEventAttendees failed', e);
    }
  },
};
</script>

<style scoped>
/* Optional styling */
</style>