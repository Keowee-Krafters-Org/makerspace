<template>
  <nav :class="['w-full border-b border-gray-200 bg-white', sticky ? 'sticky top-0 z-40' : '']">
    <div class="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
      <!-- Left: Brand -->
      <div class="flex items-center gap-2 overflow-hidden">
        <slot name="brand">
          <span class="text-lg font-semibold cursor-pointer whitespace-nowrap" @click="goHome">{{ brandText }}</span>
          <span v-if="pageTitle" class="text-gray-400 mx-1">/</span>
          <span v-if="pageTitle" class="text-base text-gray-700 font-medium truncate">{{ pageTitle }}</span>
        </slot>
      </div>

      <!-- Center: Links (Desktop) -->
      <ul class="hidden md:flex items-center gap-4 flex-shrink-0">
        <li v-for="(lnk, idx) in visibleLinks" :key="idx">
          <button
            class="text-sm px-2 py-1 rounded hover:bg-gray-100"
            :class="isActive(lnk.to) ? 'text-blue-600 font-medium' : 'text-gray-700'"
            @click="go(lnk.to)"
          >
            {{ lnk.label }}
          </button>
        </li>
      </ul>

      <!-- Right: Login/Logout & Mobile Menu Button -->
      <div class="flex items-center gap-2">
        
        <!-- Login / Logout Icons -->
        <button
          v-if="!isVerifiedStatus"
          class="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full focus:outline-none"
          @click="go({ path: '/member' })"
          title="Login"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>

        <button
          v-if="isVerifiedStatus"
          class="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full focus:outline-none"
          @click="onLogout"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>

        <!-- Mobile Hamburger Button -->
        <button 
          class="md:hidden p-2 text-gray-600 rounded hover:bg-gray-100 focus:outline-none"
          @click="isMenuOpen = !isMenuOpen"
          aria-label="Toggle menu"
        >
          <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile links -->
    <div v-show="isMenuOpen" class="md:hidden absolute top-full left-0 w-full z-50 border-t border-gray-100 bg-gray-50 px-4 py-2 shadow-md">
      <ul class="flex flex-col gap-2">
        <li v-for="(lnk, idx) in visibleLinks" :key="'m'+idx">
          <button
            class="w-full text-left px-3 py-2 rounded transition-colors"
            :class="isActive(lnk.to) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-200'"
            @click="go(lnk.to, lnk.action)"
          >
            {{ lnk.label }}
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  inject: ['session', 'appService'],
  data() {
    return {
      isMenuOpen: false
    };
  },
  props: {
    brand: { type: String, default: '' },
    pageTitle: { type: String, default: '' },
    links: {
      type: Array,
      default: () => ([
        { label: 'Events', to: { path: '/event', query: { mode: 'list' } } },
        { label: 'Member', to: { path: '/member' } },
      ]),
    },
    showMember: { type: Boolean, default: true },
    sticky: { type: Boolean, default: true },
    filterLink: { type: Function, default: null },
  },
  computed: {
    currentMember() {
      return this.session?.member || null;
    },
    memberName() {
      const m = this.currentMember || {};
      return [m.firstName, m.lastName].filter(Boolean).join(' ') || m.name || m.emailAddress || 'Member';
    },
    loginStatus() {
      return (this.currentMember?.login?.status || '').toString().toUpperCase() || 'UNREGISTERED';
    },
    registrationStatus() {
      return (this.currentMember?.registration?.status || '').toString().toUpperCase() || '';
    },
    isVerifiedStatus() {
      return this.loginStatus === 'VERIFIED';
    },
    isRegisteredStatus() {
      return this.registrationStatus === 'REGISTERED';
    },
    visibleLinks() {
      if (!this.filterLink) return this.links;
      return this.links.filter(l => {
        try { return this.filterLink(l, this.session) !== false; } catch { return true; }
      });
    },
    brandText() {
      const cfg = this.appService?.config?.organizationName
        || this.session?.organizationName
        || 'Membership Portal';
      return this.brand && this.brand.trim() ? this.brand : cfg;
    },
  },
  methods: {
    go(to, action) {
      if (action && typeof action === 'function') {
        action();
      } else if (to) {
        this.$router.push(to);
      }
      this.isMenuOpen = false;
    },
    goHome() {
      const view = (this.session?.view || '').toString().toLowerCase();
      if (view === 'member') this.go({ path: '/member' });
      else this.go({ path: '/event', query: { mode: this.session?.viewMode || 'list' } });
      this.isMenuOpen = false;
    },
    isActive(to) {
      if (!to) return false;
      const target = this.$router.resolve(to);
      return target?.href === this.$route?.href || target?.path === this.$route?.path;
    },
    async onLogout() {
      try {
        const email = this.currentMember?.emailAddress || this.currentMember?.email || '';
        const svc = this.$.appContext.provides['memberService'];
        if (svc?.logout) await svc.logout(email);
      } catch { /* ignore */ }
      finally {
        if (this.session) this.session.member = null;
        this.$router.push({ path: '/member' });
      }
      this.isMenuOpen = false;
    },
  },
};
</script>

<style scoped>
/* minimal overrides */
</style>