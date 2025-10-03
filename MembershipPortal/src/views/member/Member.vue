<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/views/member/Member.vue -->
<template>
  <div class="max-w-xl mx-auto p-4">
    <h2 class="text-2xl font-semibold mb-4">Member</h2>

    <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mb-3 text-sm text-green-700">{{ message }}</p>

    <!-- Current member info -->
    <div v-if="currentMember" class="rounded border border-gray-200 p-3 mb-4 bg-white">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">{{ currentMember.firstName }} {{ currentMember.lastName }}</div>
          <div class="text-gray-600 text-sm">{{ currentMember.emailAddress || currentMember.email }}</div>
          <div class="text-gray-600 text-sm">
            Status: <span class="font-medium">{{ loginStatus }}</span>
            <span v-if="currentMember.registration?.level" class="ml-2">Level: {{ currentMember.registration.level }}</span>
          </div>
        </div>
        <button
          class="text-sm text-blue-600 hover:text-blue-800"
          @click="onLogout"
          :disabled="loading"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Login / Verification -->
    <div class="rounded border border-gray-200 p-3 bg-white">
      <label class="block text-sm font-medium mb-1">Email</label>
      <input
        v-model.trim="email"
        type="email"
        class="block w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
        placeholder="you@example.com"
        :disabled="loading"
      />

      <div class="flex gap-2 mb-3">
        <button
          class="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          @click="onRequestToken"
          :disabled="!email || loading"
        >
          Send Sign-in Link
        </button>
        <button
          class="px-3 py-2 rounded bg-gray-600 text-white text-sm hover:bg-gray-700 disabled:opacity-50"
          @click="onResendToken"
          :disabled="!email || loading"
        >
          Resend
        </button>
      </div>

      <label class="block text-sm font-medium mb-1">Verification Code</label>
      <input
        v-model.trim="token"
        type="text"
        class="block w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
        placeholder="Enter the code from your email"
        :disabled="loading"
      />

      <button
        class="px-3 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
        @click="onVerifyCode"
        :disabled="!email || !token || loading"
      >
        Verify & Sign In
      </button>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue';

export default {
  name: 'MemberView',
  data() {
    return {
      email: '',
      token: '',
      error: '',
      message: '',
      loading: false,
      redirectTarget: null, // NEW
    };
  },
  computed: {
    session() {
      return this._session || inject('session');
    },
    currentMember() {
      return this.session?.member || null;
    },
    loginStatus() {
      return (this.currentMember?.login?.status || '').toString().toUpperCase() || 'UNREGISTERED';
    },
    isVerified() {
      return this.loginStatus === 'VERIFIED';
    },
  },
  created() {
    this.memberService = inject('memberService');
    this.logger = inject('logger');
    this._session = inject('session');

    if (this.currentMember?.emailAddress || this.currentMember?.email) {
      this.email = this.currentMember.emailAddress || this.currentMember.email;
    }

    this.redirectTarget = this.parseRedirect(this.$route?.query?.redirect);
    // If already verified and we have a redirect, go back immediately
    if (this.isVerified && this.redirectTarget) {
      this.redirectBack(true);
    }
  },
  watch: {
    currentMember(m) {
      if (m?.emailAddress || m?.email) {
        this.email = m.emailAddress || m.email;
      }
      // If member becomes verified while on this page, redirect back
      if (this.isVerified && this.redirectTarget) {
        this.redirectBack();
      }
    },
  },
  methods: {
    parseRedirect(raw) {
      if (!raw) return null;
      try {
        // Support encoded JSON target { path, query }
        const decoded = decodeURIComponent(raw);
        const obj = JSON.parse(decoded);
        if (obj && typeof obj === 'object' && obj.path) return obj;
      } catch {
        try {
          // Support plain encoded path
          const path = decodeURIComponent(raw);
          if (typeof path === 'string' && path) return { path };
        } catch {
          /* ignore */
        }
      }
      return null;
    },
    redirectBack(replace = false) {
      if (!this.redirectTarget) return;
      if (replace) {
        this.$router.replace(this.redirectTarget);
      } else {
        this.$router.push(this.redirectTarget);
      }
    },

    async onRequestToken() {
      this.error = '';
      this.message = '';
      this.loading = true;
      try {
        const member = await this.memberService.requestToken(this.email);
        if (member && typeof member === 'object') {
          this.session.member = member;
        }
        this.message = 'If the email exists, a sign-in link or code has been sent.';
      } catch (e) {
        this.error = e?.message || 'Failed to request token';
        this.logger?.error?.('requestToken failed', e);
      } finally {
        this.loading = false;
      }
    },
    async onVerifyCode() {
      this.error = '';
      this.message = '';
      this.loading = true;
      try {
        const res = await this.memberService.verifyCode(this.email, this.token);
        if (res?.redirectToForm && res.url) {
          window.location.assign(res.url);
          return;
        }
        if (res?.member) {
          this.session.member = res.member;
          this.message = 'Signed in successfully.';
          this.token = '';
          // Redirect back to the originating page if provided
          if (this.redirectTarget) this.redirectBack();
        } else {
          this.message = 'Verification complete.';
          if (this.redirectTarget) this.redirectBack();
        }
      } catch (e) {
        this.error = e?.message || 'Failed to verify token';
        this.logger?.error?.('verifyCode failed', e);
      } finally {
        this.loading = false;
      }
    },
    async onResendToken() {
      this.error = '';
      this.message = '';
      this.loading = true;
      try {
        await this.memberService.resendToken(this.email);
        this.message = 'Verification email resent.';
      } catch (e) {
        this.error = e?.message || 'Failed to resend token';
        this.logger?.error?.('resendToken failed', e);
      } finally {
        this.loading = false;
      }
    },
    async onLogout() {
      this.error = '';
      this.message = '';
      this.loading = true;
      try {
        await this.memberService.logout(this.currentMember?.emailAddress || this.currentMember?.email || this.email);
      } catch {
        // ignore backend logout failures
      } finally {
        this.session.member = null;
        this.message = 'Logged out.';
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>