<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/views/memberLanding/MemberLanding.vue -->
<template>
  <div class="member-landing">
    <!-- Welcome Banner -->
    <header class="bg-blue-500 text-white p-4">
      <h1 class="text-2xl font-bold">Welcome, {{ member.firstName }}!</h1>
      <p class="text-sm">We're glad to have you back.</p>
    </header>

    <!-- Member Menu -->
    <nav class="member-menu p-4">
      <ul class="menu-list">
        <li
          v-for="menuItem in menuItems"
          :key="menuItem.label"
          class="menu-item"
        >
          <Button
            :label="menuItem.label"
            :disabled="menuItem.disabled"
            @click="menuItem.action"
          />
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';

export default {
  name: 'MemberLanding',
  components: { Button },
  inject: ['session'],
  props: {
    member: { type: Object, required: true },
  },
  computed: {
    // Dynamically generate menu items based on the member's authentication level
    menuItems() {
      const level = this.member.authentication?.level || 'guest';

      const menu = {
        guest: [
          { label: 'Sign Up', action: this.signUp, disabled: false },
          { label: 'Learn More', action: this.learnMore, disabled: false },
          { label: 'View Events', action: this.viewEvents, disabled: false },
        ],
        member: [
          { label: 'View Profile', action: this.viewProfile, disabled: false },
          { label: 'Edit Profile', action: this.editProfile, disabled: false },
          { label: 'View Events', action: this.viewEvents, disabled: false },
        ],
        admin: [
          { label: 'Manage Members', action: this.manageMembers, disabled: false },
          { label: 'Manage Events', action: this.manageEvents, disabled: false },
          { label: 'View Reports', action: this.viewReports, disabled: false },
        ],
      };

      // Return the menu items for the current authentication level
      return menu[level] || [];
    },
  },
  methods: {
    // Define actions for menu items
    signUp() {
      console.log('Sign Up action triggered');
    },
    learnMore() {
      console.log('Learn More action triggered');
    },
    viewProfile() {
      console.log('View Profile action triggered');
    },
    editProfile() {
      console.log('Edit Profile action triggered');
    },
    viewEvents() {
      // Force list mode for the Events view
      if (this.session) this.session.viewMode = 'list';
      this.$router.push({ path: '/event', query: { mode: 'list' } });
    },
    manageMembers() {
      console.log('Manage Members action triggered');
    },
    manageEvents() {
      console.log('Manage Events action triggered');
    },
    viewReports() {
      console.log('View Reports action triggered');
    },
  },
};
</script>

<style scoped>
.member-landing {
  font-family: Arial, sans-serif;
}

.member-menu {
  margin-top: 1rem;
}

.menu-list {
  list-style: none;
  padding: 0;
}

.menu-item {
  margin-bottom: 1rem;
}
</style>