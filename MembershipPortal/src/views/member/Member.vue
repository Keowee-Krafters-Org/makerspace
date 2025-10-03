<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/views/member/Member.vue -->
<template>
  <div class="max-w-xl mx-auto p-4">
    <h2 class="text-2xl font-semibold mb-4">Member</h2>

    <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mb-3 text-sm text-green-700">{{ message }}</p>

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

      <!-- New account confirmation prompt when email not found -->
      <div
        v-if="showNewAccountPrompt"
        class="rounded border border-amber-300 bg-amber-50 text-amber-900 p-3 mb-3 text-sm"
      >
        <p class="mb-2">
          We couldn't find an account for <span class="font-medium">{{ email }}</span>.
          If this was a typo, please correct your email and try again.
          Otherwise, confirm you’re new to {{ orgName }} and we’ll create an account.
        </p>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
            @click="onCorrectEmail"
            :disabled="loading"
          >
            Correct Email
          </button>
          <button
            class="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
            @click="onConfirmCreateNew"
            :disabled="loading"
          >
            I’m new to {{ orgName }}
          </button>
        </div>
      </div>

      <!-- Verification Code: visible only while verifying -->
      <div v-if="showVerificationInputs">
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
  </div>
</template>

<script>
import { inject, nextTick } from 'vue';

export default {
  name: 'MemberView',
  inject: ['session'],
  data() {
    return {
      email: '',
      token: '',
      error: '',
      message: '',
      loading: false,
      redirectTarget: null,
      showNewAccountPrompt: false,
      allowAutoCreate: false,
    };
  },
  computed: {
    currentMember() {
      return this.session?.member || null;
    },
    loginStatus() {
      return (this.currentMember?.login?.status || '').toString().toUpperCase() || 'UNREGISTERED';
    },
    registrationStatus() {
      return (this.currentMember?.registration?.status || '').toString().toUpperCase() || '';
    },
    isVerified() {
      return this.loginStatus === 'VERIFIED';
    },
    isRegistered() {
      return this.registrationStatus === 'REGISTERED';
    },
    isVerifiedAndRegistered() {
      return this.isVerified && this.isRegistered;
    },
    showVerificationInputs() {
      return this.loginStatus === 'VERIFYING';
    },
    orgName() {
      return this.appService?.config?.organizationName || 'our organization';
    },
    isNewRegistration() {
      return this.registrationStatus === 'NEW';
    },
  },
  created() {
    this.memberService = inject('memberService');
    this.logger = inject('logger');
    this.appService = inject('appService');

    if (this.currentMember?.emailAddress || this.currentMember?.email) {
      this.email = this.currentMember.emailAddress || this.currentMember.email;
    }

    this.redirectTarget = this.parseRedirect(this.$route?.query?.redirect);

    if (this.redirectTarget && this.isVerified) {
      this.redirectBack(true);
      return;
    }
    // If verified and NEW, route to registration
    if (!this.redirectTarget && this.isVerified && this.isNewRegistration) {
      this.routeToMemberRegistration(true);
      return;
    }
    if (!this.redirectTarget && this.isVerifiedAndRegistered) {
      this.routeToMemberLanding(true);
    }
  },
  watch: {
    currentMember(m) {
      if (m?.emailAddress || m?.email) this.email = m.emailAddress || m.email;
      if (this.redirectTarget && this.isVerified) {
        this.redirectBack();
        return;
      }
      if (!this.redirectTarget && this.isVerified && this.isNewRegistration) {
        this.routeToMemberRegistration();
        return;
      }
      if (!this.redirectTarget && this.isVerifiedAndRegistered) {
        this.routeToMemberLanding();
      }
    },
  },
  methods: {
    parseRedirect(raw) {
      if (!raw) return null;
      try {
        const decoded = decodeURIComponent(raw);
        const obj = JSON.parse(decoded);
        if (obj && typeof obj === 'object' && obj.path) return obj;
      } catch {
        try {
          const path = decodeURIComponent(raw);
          if (typeof path === 'string' && path) return { path };
        } catch { /* ignore */ }
      }
      return null;
    },
    redirectBack(replace = false) {
      if (!this.redirectTarget) return;
      return replace ? this.$router.replace(this.redirectTarget) : this.$router.push(this.redirectTarget);
    },
    routeToMemberLanding(replace = false) {
      const named = { name: 'MemberLanding' };
      const namedRes = this.$router.resolve(named);
      if (namedRes && namedRes.name) return replace ? this.$router.replace(named) : this.$router.push(named);
      const pathTarget = { path: '/member/landing' };
      const pathRes = this.$router.resolve(pathTarget);
      if (pathRes && pathRes.matched && pathRes.matched.length) return replace ? this.$router.replace(pathTarget) : this.$router.push(pathTarget);
      if (this.$route.path !== '/member') return replace ? this.$router.replace({ path: '/member' }) : this.$router.push({ path: '/member' });
    },
    routeToMemberRegistration(replace = false) {
      const named = { name: 'MemberRegistration' };
      const res = this.$router.resolve(named);
      if (res && res.name) return replace ? this.$router.replace(named) : this.$router.push(named);
      const pathTarget = { path: '/member/register' };
      const pathRes = this.$router.resolve(pathTarget);
      if (pathRes && pathRes.matched && pathRes.matched.length) return replace ? this.$router.replace(pathTarget) : this.$router.push(pathTarget);
    },

    async onRequestToken() {
      this.error = '';
      this.message = '';
      this.loading = true;
      this.showNewAccountPrompt = false;
      try {
        const email = (this.email || '').trim();
        if (!email) throw new Error('Email is required');

        // Pre-check existence unless user already confirmed new-account flow
        if (!this.allowAutoCreate) {
          const existing = await this.memberService.findMemberByEmail(email);
          if (!existing) {
            this.showNewAccountPrompt = true;
            this.message = '';
            return; // stop here; wait for user decision
          }
        }

        // Proceed with sending sign-in link/code
        const member = await this.memberService.requestToken(email);
        if (member && typeof member === 'object') {
          this.session.member = member;
        }
        this.message = 'If the email exists, a sign-in link or code has been sent.';
        this.allowAutoCreate = false; // reset after use
      } catch (e) {
        this.error = e?.message || 'Failed to request token';
        this.logger?.error?.('requestToken failed', e);
      } finally {
        this.loading = false;
      }
    },

    onCorrectEmail() {
      this.showNewAccountPrompt = false;
      this.allowAutoCreate = false;
      // keep focus on email field for correction
    },

    async onConfirmCreateNew() {
      // User confirmed new-account creation: allow and re-run request
      this.allowAutoCreate = true;
      await this.onRequestToken();
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
          await nextTick();
          this.message = 'Signed in successfully.';
          this.token = '';
          if (this.redirectTarget) {
            this.redirectBack();
          } else if (this.isVerifiedAndRegistered) {
            this.routeToMemberLanding();
          }
        } else {
          this.message = 'Verification complete.';
          if (this.redirectTarget) {
            this.redirectBack();
          } else if (this.isVerifiedAndRegistered) {
            this.routeToMemberLanding();
          }
        }
      } catch (e) {
        this.error = e?.message || 'Failed to verify token';
        this.logger?.error?.('verifyCode failed', e);
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