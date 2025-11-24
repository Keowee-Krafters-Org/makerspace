<template>
  <div class="max-w-3xl mx-auto p-4">
    <h2 class="text-2xl font-semibold mb-4">Release of Liability</h2>
    <p class="text-sm text-gray-600 mb-3">
      Please complete this form to continue your registration.
    </p>

    <div class="mb-3 flex gap-2">
      <button
        class="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
        @click="openInNewTab"
      >
        Open Form in New Tab
      </button>
      <button
        class="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
        :disabled="loading"
        @click="onCompleted"
      >
        I completed the form
      </button>
    </div>

    <div class="border border-gray-200 rounded overflow-hidden bg-white">
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        class="w-full"
        style="min-height: 80vh;"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
        referrerpolicy="no-referrer-when-downgrade"
      >
        Loading…
      </iframe>
      <div v-else class="p-4 text-sm text-red-600">
        Form configuration missing. Ask an administrator to set forms.waiver in config.
      </div>
    </div>

    <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mt-3 text-sm text-green-700">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'MemberWaiver',
  inject: ['session', 'appService', 'memberService'],
  data() {
    return { loading: false, error: '', message: '' };
  },
  computed: {
    embedUrl() {
      const m = this.session?.member || {};
      return this.memberService?.buildPrefilledFormUrl('waiver', m) || '';
    },
    redirectParam() {
      return this.$route?.query?.redirect || '';
    },
  },
  methods: {
    openInNewTab() {
      if (!this.embedUrl) return;
      try {
        const url = new URL(this.embedUrl);
        url.searchParams.delete('embedded');
        window.open(url.toString(), '_blank', 'noopener');
      } catch {
        window.open(this.embedUrl, '_blank', 'noopener');
      }
    },
    async onCompleted() {
      this.error = '';
      this.message = '';
      this.loading = true;
      try {
        // Refresh member from backend to pick up status change after form submission
        const email = this.session?.member?.emailAddress || this.session?.member?.email || '';
        if (email && this.memberService?.getMemberByEmail) {
          const refreshed = await this.memberService.getMemberByEmail(email);
          if (refreshed && typeof refreshed === 'object') this.session.member = refreshed;
        }
        // Return to Member view; it will redirect back to the event if canSignup and redirect is present
        const target = { path: '/member' };
        if (this.redirectParam) target.query = { redirect: this.redirectParam };
        this.$router.push(target);
      } catch (e) {
        this.error = e?.message || 'Could not refresh member status';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* optional styles */
</style>