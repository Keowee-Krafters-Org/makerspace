<template>
  <!-- Menu Layout -->
  <div v-if="layout === 'menu'" class="relative inline-block text-left">
    <Button
      icon="menu"
      variant="icon"
      @click.stop="toggleMenu"
    />
    <div
      v-if="isOpen"
      class="mt-2 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 focus:outline-none" 
      @click.stop
    >
      <div class="py-1" role="menu">
        <button
          v-for="action in visibleActions"
          :key="action.id"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          :disabled="action.disabled"
          @click="handleAction(action)"
        >
          <Icon v-if="action.icon" :name="action.icon" size="16" />
          {{ action.label }}
        </button>
      </div>
    </div>
    <!-- Simple click-outside overlay -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-40 bg-transparent" 
      @click="isOpen = false"
    ></div>
  </div>

  <!-- Row/Default Layout -->
  <div v-else class="flex flex-wrap items-center gap-3">
    <Button
      v-for="action in visibleActions"
      :key="action.id"
      :icon="action.icon"
      :label="action.label"
      :disabled="action.disabled"
      @click="action.handler"
    />
  </div>
</template>

<script>
import Button from './Button.vue';
import Icon from './Icon.vue';

export default {
  name: 'EventButtonPanel',
  components: { Button, Icon },
  emits: ['details', 'edit', 'delete', 'attendees', 'signup', 'unregister'],
  props: {
    event: { type: Object, required: true },
    member: { type: Object, default: null },
    pending: { type: Boolean, default: false },
    showDetails: { type: Boolean, default: true },
    showAttendees: { type: Boolean, default: false },
    showSignup: { type: Boolean, default: true },
    detailsLabel: { type: String, default: 'Details' },
    layout: { type: String, default: 'row' }, // 'row' or 'menu'
  },
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    visibleActions() {
      return [
        {
          id: 'details',
          label: this.detailsLabel,
          icon: 'eye',
          show: this.showDetails,
          handler: () => this.$emit('details', this.event),
        },
        {
          id: 'edit',
          label: 'Edit',
          icon: 'pencil',
          show: this.canEdit,
          handler: () => this.$emit('edit', this.event),
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: 'trash',
          show: this.canEdit,
          handler: () => this.$emit('delete', this.event),
        },
        {
          id: 'attendees',
          label: 'Attendees',
          icon: 'users',
          show: this.showAttendees,
          handler: () => this.$emit('attendees', this.event),
        },
        {
          id: 'signup',
          label: this.soldOut ? 'Sold Out' : (this.pending ? 'Working...' : 'Sign Me Up'),
          icon: 'user-plus',
          show: this.showSignup && !this.isRegistered,
          disabled: this.soldOut || this.pending,
          handler: () => this.$emit('signup', this.event),
        },
        {
          id: 'unregister',
          label: this.pending ? 'Working...' : 'Cancel my Signup',
          icon: 'user-minus',
          show: this.showSignup && this.isRegistered,
          disabled: this.pending,
          handler: () => this.$emit('unregister', this.event),
        },
      ].filter(a => a.show);
    },
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
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
    },
    handleAction(action) {
      if (action.disabled) return;
      action.handler();
      this.isOpen = false;
    },
  },
};
</script>