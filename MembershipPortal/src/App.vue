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
  data() {
    return {
      brand: 'Makerspace',
      navLinks: [
        { label: 'Classes', to: { path: '/event', query: { mode: 'list', type: 'Class' } } },
        { label: 'Events', to: { path: '/event', query: { mode: 'list', type: 'Event' }} },
        { label: 'Member', to: { path: '/member' } },
        // Add more links as needed
      ],
    };
  },
  methods: {
    // Example: only show Admin when authorized
    filterLink(link, session) {
      if (link.label !== 'Admin') return true;
      const lvl = (session?.member?.registration?.level || '').toString().toUpperCase();
      return ['ADMIN', 'ADMINISTRATOR', 'MANAGER', 'OWNER'].includes(lvl);
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>