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

      <!-- Right: Member -->
      <div v-if="showMember" class="flex items-center gap-3">
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

    <!-- Mobile links -->
    <div class="md:hidden px-4 pb-2">
      <ul class="flex flex-wrap gap-2">
        <li v-for="(lnk, idx) in visibleLinks" :key="'m'+idx">
          <button
            class="text-sm px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
            :class="isActive(lnk.to) ? 'text-blue-600 font-medium' : 'text-gray-700'"
            @click="go(lnk.to)"
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
    go(to) { if (to) this.$router.push(to); },
    goHome() {
      const view = (this.session?.view || '').toString().toLowerCase();
      if (view === 'member') this.go({ path: '/member' });
      else this.go({ path: '/event', query: { mode: this.session?.viewMode || 'list' } });
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
    },
  },
};
</script>

<style scoped>
/* minimal overrides */
</style>