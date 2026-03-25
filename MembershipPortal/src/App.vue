<template>
  <div class="app-layout flex flex-col h-full w-full overflow-y-auto bg-gray-50">
    <NavBar
      :brand="brand"
      :links="navLinks"
      :page-title="pageTitle"
      :showMember="true"
      :sticky="true"
      :filterLink="filterLink"
    />
    <main class="flex-grow w-full max-w-6xl mx-auto px-4 pb-16">
      <router-view />
    </main>
    <footer class="py-4 text-center text-xs text-gray-400 mt-auto">
      v{{ version }}
    </footer>
    <Spinner />
  </div>
</template>

<script>
import Spinner from '@/components/Spinner.vue';
import NavBar from '@/components/NavBar.vue';

export default {
  name: 'App',
  components: { Spinner, NavBar },
  inject: ['appService', 'session'],
  data() {
    return {
      version: this.appService?.config?.version || '',
      brand: this.appService?.config?.organization?.name || 'Makerspace',
      pageTitle: '',
    };
  },
  computed: {
    navLinks() {
      const member = this.session?.member;
      const isVerified = (member?.login?.status || '').toUpperCase() === 'VERIFIED';
      const memberName = [member?.firstName, member?.lastName].filter(Boolean).join(' ') || member?.name || 'Member';

      return [
        { label: 'Classes', to: { path: '/event', query: { mode: 'list', type: 'Class' } } },
        { label: 'Events', to: { path: '/event', query: { mode: 'list', type: 'Event' }} },
        { label: 'Manage Members', to: { path: '/admin' }, role: 'admin' },
        { label: 'Manage Classes', to: { path: '/event', query: { mode: 'table', type: 'Class' } }, role: 'admin' },
        { label: 'Manage Events', to: { path: '/event', query: { mode: 'table', type: 'Event' } }, role: 'admin' },
        { label: isVerified ? memberName : 'Guest', to: { path: '/member' } },
      ];
    }
  },
  provide() {
    return {
      setPageTitle: this.setPageTitle,
    };
  },
  methods: {
    setPageTitle(title) {
      this.pageTitle = title;
      // Also update browser tab title
      if (title) document.title = `${this.brand} - ${title}`;
      else document.title = this.brand;
    },
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

<style>
html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevent body scroll, handle in app-layout */
}

#app {
  height: 100%;
  width: 100%;
}

.app-layout {
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}
</style>