<template>
  <div id="app">
    <NavBar
      :brand="brand"
      :links="navLinks"
      :showMember="true"
      :sticky="true"
      :filterLink="filterLink"
    />
    <router-view />
    <Spinner />
  </div>
</template>

<script>
import Spinner from '@/components/Spinner.vue';
import NavBar from '@/components/NavBar.vue';

export default {
  name: 'App',
  components: { Spinner, NavBar },
  inject: ['appService'],
  data() {
    return {
      brand: this.appService?.config?.organization?.name || 'Makerspace',
      navLinks: [
        { label: 'Classes', to: { path: '/event', query: { mode: 'list', type: 'Class' } } },
        { label: 'Events', to: { path: '/event', query: { mode: 'list', type: 'Event' }} },
        { label: 'Manage Members', to: { path: '/admin' }, role: 'admin' },
        { label: 'Manage Events', to: { path: '/event', query: { mode: 'table' } }, role: 'admin' },
        { label: 'Member', to: { path: '/member' } },
      ],
    };
  },
  methods: {
    filterLink(link, session) {
      if (!link.role) return true;
      const lvl = (session?.member?.registration?.level || '').toString().toUpperCase();
      const isAdmin = ['ADMIN', 'ADMINISTRATOR', 'MANAGER', 'OWNER'].includes(lvl);
      if (link.role === 'admin') return isAdmin;
      return true;
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>