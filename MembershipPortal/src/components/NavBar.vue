<template>
  <nav :class="['w-full border-b border-gray-200 bg-white', sticky ? 'sticky top-0 z-40' : '']">
    <div class="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
      <!-- Left: Brand -->
      <div class="flex items-center gap-2">
        <slot name="brand">
          <span class="text-lg font-semibold cursor-pointer" @click="goHome">{{ brandText }}</span>
        </slot>
      </div>

      <!-- Center: Links -->
      <ul class="hidden md:flex items-center gap-4">
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

      <!-- Right: Member (Desktop) -->
      <div v-if="showMember" class="hidden md:flex items-center gap-3">
        <div class="text-sm text-gray-700">
          <template v-if="currentMember">
            <span class="font-medium">{{ memberName }}</span>
            <span class="text-gray-400">•</span>
            <span class="inline-flex items-center gap-1">
              <span v-if="isVerifiedStatus" class="text-green-600" aria-label="Verified" title="Verified">✔</span>
              <span>{{ loginStatus }}</span>
            </span>
            <template v-if="registrationStatus">
              <span class="text-gray-400">•</span>
              <span class="inline-flex items-center gap-1">
                <span v-if="isRegisteredStatus" class="text-green-600" aria-label="Registered" title="Registered">✔</span>
                <span>{{ registrationStatus }}</span>
              </span>
            </template>
          </template>
          <template v-else>
            <span class="text-gray-500">Not signed in</span>
          </template>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="!currentMember"
            class="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            @click="go({ path: '/member' })"
          >
            Sign In
          </button>
          <button
            v-else
            class="text-sm px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-800"
            @click="onLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile links & Member Info -->
    <div v-show="isMenuOpen" class="md:hidden border-t border-gray-100 bg-gray-50 px-4 py-2 shadow-inner">
      <ul class="flex flex-col gap-2 mb-4">
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
      
      <!-- Mobile Member Info -->
      <div v-if="showMember" class="pt-2 border-t border-gray-200">
        <div class="flex flex-col gap-2">
           <template v-if="currentMember">
            <div class="text-sm text-gray-700 mb-2">
                <div class="font-medium text-base mb-1">{{ memberName }}</div>
                <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span class="inline-flex items-center gap-1">
                        <span v-if="isVerifiedStatus" class="text-green-600">✔</span>
                        <span>{{ loginStatus }}</span>
                    </span>
                    <template v-if="registrationStatus">
                        <span class="text-gray-300">|</span>
                        <span class="inline-flex items-center gap-1">
                            <span v-if="isRegisteredStatus" class="text-green-600">✔</span>
                            <span>{{ registrationStatus }}</span>
                        </span>
                    </template>
                </div>
            </div>
            <button
                class="w-full text-center text-sm px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-800"
                @click="onLogout"
            >
                Logout
            </button>
           </template>
           <template v-else>
             <div class="text-sm text-gray-500 mb-2">Not signed in</div>
             <button
                class="w-full text-center text-sm px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                @click="go({ path: '/member' })"
              >
                Sign In
            </button>
           </template>
        </div>
      </div>
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