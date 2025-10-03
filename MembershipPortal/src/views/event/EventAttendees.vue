<template>
  <div class="p-4">
    <header class="flex items-center justify-between mb-3">
      <h3 class="text-xl font-semibold">Attendees</h3>
      <Button label="Back" @click="$router.back()" />
    </header>

    <Message v-if="error" type="error" :message="error" class="mb-3" />

    <table class="min-w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="text-left p-2 border">Name</th>
          <th class="text-left p-2 border">Email</th>
          <th class="text-left p-2 border">Phone</th>
          <th class="text-left p-2 border">Outstanding Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in attendees" :key="a.id || a.emailAddress">
          <td class="p-2 border">{{ [a.firstName, a.lastName].filter(Boolean).join(' ') || 'N/A' }}</td>
          <td class="p-2 border">{{ a.emailAddress || 'N/A' }}</td>
          <td class="p-2 border">{{ a.phoneNumber || 'N/A' }}</td>
          <td class="p-2 border">
            {{ a.outstandingBalance ? `$${Number(a.outstandingBalance).toFixed(2)}` : '$0.00' }}
          </td>
        </tr>
        <tr v-if="!attendees.length">
          <td class="p-4 text-center text-gray-500 border" colspan="4">No attendees for this event.</td>
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