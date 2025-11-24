<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/views/memberLanding/MemberLanding.vue -->
<template>
  <div class="member-landing p-4 max-w-2xl mx-auto">
    <!-- Member menu only; NavBar shows member info -->
    <nav class="member-menu">
      <ul class="menu-list">
        <li
          v-for="menuItem in menuItems"
          :key="menuItem.label"
          class="menu-item"
        >
          <Button
            :label="`${menuItem.icon ? menuItem.icon + ' ' : ''}${menuItem.label}`"
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
  computed: {
    authLevel() {
      const lvl = (this.session?.member?.registration?.level || '').toString().toUpperCase();
      if (['ADMIN', 'ADMINISTRATOR', 'MANAGER', 'OWNER'].includes(lvl)) return 'admin';
      if (['MEMBER', 'HOST', 'INSTRUCTOR'].includes(lvl)) return 'member';
      return 'guest';
    },
    menuItems() {
      const commonViewEvents = { label: 'View Events', icon: '📅', action: this.viewEvents, disabled: false };
      const byLevel = {
        guest: [
          { label: 'Sign Up', icon: '📝', action: this.signUp, disabled: false },
          { label: 'Learn More', icon: 'ℹ️', action: this.learnMore, disabled: false },
          commonViewEvents,
        ],
        member: [
          { label: 'View Profile', icon: '👤', action: this.viewProfile, disabled: false },
          { label: 'Edit Profile', icon: '✏️', action: this.editProfile, disabled: false },
          commonViewEvents,
        ],
        admin: [
          { label: 'Manage Members', icon: '👥', action: this.manageMembers, disabled: false },
          { label: 'Manage Events', icon: '🗓️', action: this.manageEvents, disabled: false },
          { label: 'View Reports', icon: '📊', action: this.viewReports, disabled: false },
          commonViewEvents,
        ],
      };
      return byLevel[this.authLevel] || [commonViewEvents];
    },
  },
  methods: {
    signUp() { console.log('Sign Up action triggered'); },
    learnMore() { console.log('Learn More action triggered'); },
    viewProfile() { console.log('View Profile action triggered'); },
    editProfile() { console.log('Edit Profile action triggered'); },
    viewEvents() {
      if (this.session) this.session.viewMode = 'list';
      this.$router.push({ path: '/event', query: { mode: 'list' } });
    },
    manageMembers() {
      this.$router.push({ path: '/admin' });
    },
    manageEvents() {
      if (this.session) this.session.viewMode = 'table';
      this.$router.push({ path: '/event', query: { mode: 'table' } });
    },
    viewReports() { console.log('View Reports action triggered'); },
  },
};
</script>

<style scoped>
.member-menu { margin-top: 0.5rem; }
.menu-list { list-style: none; padding: 0; }
.menu-item { margin-bottom: 0.75rem; }
</style>