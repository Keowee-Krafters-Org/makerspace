<template>
  <div class="flex flex-wrap items-center gap-3">
    <!-- View details (list/card/table) -->
    <Button
      v-if="showDetails"
      icon="eye"
      :label="detailsLabel"
      @click="$emit('details', event)"
    />
    <!-- Edit (admins or higher) -->
    <Button
      v-if="canEdit"
      icon="pencil"
      label="Edit"
      @click="$emit('edit', event)"
    />
    <!-- Delete (admins or higher) -->
    <Button
      v-if="canEdit"
      icon="trash"
      label="Delete"
      @click="$emit('delete', event)"
    />
    <!-- Attendees (table view only typically) -->
    <Button
      v-if="showAttendees"
      icon="users"
      label="Attendees"
      @click="$emit('attendees', event)"
    />
    <!-- Signup / Unregister (member actions) -->
    <Button
      v-if="showSignup && !isRegistered"
      icon="user-plus"
      :disabled="soldOut || pending"
      :label="soldOut ? 'Sold Out' : (pending ? 'Working...' : 'Sign Me Up')"
      @click="$emit('signup', event)"
    />
    <Button
      v-if="showSignup && isRegistered"
      icon="user-minus"
      :disabled="pending"
      :label="pending ? 'Working...' : 'Cancel my Signup'"
      @click="$emit('unregister', event)"
    />
  </div>
</template>

<script>
import Button from './Button.vue';

export default {
  name: 'EventButtonPanel',
  components: { Button },
  emits: ['details', 'edit', 'delete', 'attendees', 'signup', 'unregister'],
  props: {
    event: { type: Object, required: true },
    member: { type: Object, default: null },
    pending: { type: Boolean, default: false },
    showDetails: { type: Boolean, default: true },
    showAttendees: { type: Boolean, default: false },
    showSignup: { type: Boolean, default: true },
    detailsLabel: { type: String, default: 'Details' },
  },
  computed: {
    registrationLevel() {
      const m = this.member || {};
      return (
        m?.registration?.level || m?.level || m?.role || ''
      ).toString().toUpperCase();
    },
    canEdit() {
      const elevated = [
        'ADMINISTRATOR','ADMIN','OWNER','MANAGER',
        'BOARD','PRESIDENT','VICE PRESIDENT',
        'SECRETARY','TREASURER'
      ];
      return elevated.includes(this.registrationLevel);
    },
    isRegistered() {
      const me = this.member?.emailAddress || this.member?.email;
      const attendees = Array.isArray(this.event?.attendees) ? this.event.attendees : [];
      return !!attendees.find(a => (a.emailAddress || a.email) === me);
    },
    soldOut() {
      const limit = Number(this.event?.eventItem?.sizeLimit || 0);
      const count = Array.isArray(this.event?.attendees) ? this.event.attendees.length : 0;
      return limit > 0 && count >= limit;
    },
  },
};
</script>