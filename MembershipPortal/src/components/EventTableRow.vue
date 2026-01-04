<template>
  <tr class="hover:bg-gray-50">
    <td class="td">{{ ev.title || ev.name || ev.eventItem?.title }}</td>
    <td class="td">{{ formatDate(ev.date) }}</td>
    <td class="td">{{ ev.eventItem?.duration }}</td>
    <td class="td">{{ ev.location?.name }}</td>
    <td class="td">
      <EventButtonPanel
        :event="ev"
        :member="member"
        :pending="pendingMap[ev.id]"
        :showDetails="true"
        :showAttendees="true"
        :showSignup="true"
        detailsLabel="View"
        @details="$emit('select', ev)"
        @edit="$emit('edit', ev)"
        @delete="$emit('delete', ev)"
        @attendees="$emit('attendees', ev)"
        @signup="onSignup(ev)"
        @unregister="onUnregister(ev)"
      />
    </td>
  </tr>
</template>

<script>
import EventButtonPanel from './EventButtonPanel.vue';

export default {
  name: 'EventTableRow',
  components: { EventButtonPanel },
  emits: ['select', 'edit', 'delete', 'attendees', 'refresh'],
  props: {
    ev: { type: Object, required: true },
    member: { type: Object, default: null },
    eventService: { type: Object, required: true },
  },
  data() {
    return { pendingMap: {} };
  },
  methods: {
    formatDate(value) {
      if (!value) return '';
      try {
        const d = typeof value === 'string' ? new Date(value) : value;
        return d.toLocaleString();
      } catch {
        return String(value);
      }
    },
    async onSignup(ev) {
      this.pendingMap[ev.id] = true;
      try {
        const res = await this.eventService.signup(ev.id, this.member?.id);
        if (res?.success) this.$emit('refresh');
      } finally {
        this.pendingMap[ev.id] = false;
      }
    },
    async onUnregister(ev) {
      this.pendingMap[ev.id] = true;
      try {
        const res = await this.eventService.unregister(ev.id, this.member?.id);
        if (res?.success) this.$emit('refresh');
      } finally {
        this.pendingMap[ev.id] = false;
      }
    },
  },
};
</script>