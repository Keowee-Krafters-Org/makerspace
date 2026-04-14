<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/views/member/Member.vue -->
<template>
  <div class="max-w-xl mx-auto p-4">
    <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mb-3 text-sm text-green-700">{{ message }}</p>

    <!-- Login / Verification -->
    <div class="rounded border border-gray-200 p-3 bg-white">
      <label class="block text-sm font-medium mb-1">Welcome, Please Enter Your Email</label>
      <input
        v-model.trim="email"
        type="email"
        class="block w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
        placeholder="you@example.com"
        :disabled="loading || showVerificationInputs"
      />

      <div v-if="!showNewAccountPrompt" class="flex gap-2 mb-3">
        <button
          class="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          @click="showVerificationInputs ? onResendToken() : onRequestToken()"
          :disabled="!email || loading"
        >
          {{ showVerificationInputs ? 'Resend Code' : 'Verify Email' }}
        </button>
      </div>

      <!-- New account confirmation prompt when email not found -->
      <div
        v-if="showNewAccountPrompt"
        class="rounded border border-amber-300 bg-amber-50 text-amber-900 p-3 mb-3 text-sm"
      >
        <p class="mb-2">
          We could not find account {{ email }} in {{ orgName }}.
        </p>
        <p class="mb-2">
          Would you like to create a new account?
        </p>

        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
            @click="onConfirmCreateNew"
            :disabled="loading"
          >
             Yes, create a new account
          </button>
          <button
            class="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
            @click="onCorrectEmail"
            :disabled="loading"
          >
            Oops I mistyped my email
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
  // Inject session + setPageTitle for nav management
  inject: ['session', 'setPageTitle', 'memberService', 'logger', 'appService'],
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
      // New: controls visibility of the verification code input
      showVerificationInputs: false,
    };
  },
  computed: {
    currentMember() { return this.session?.member || null; },
    loginStatus() { return (this.currentMember?.login?.status || '').toString().toUpperCase(); },
    registrationStatus() { return (this.currentMember?.registration?.status || '').toString().toUpperCase(); },
    isVerified() { return this.loginStatus === 'VERIFIED'; },
    isNewRegistration() { return this.registrationStatus === 'NEW'; },
    isAppliedRegistration() { return this.registrationStatus === 'APPLIED'; },
    canSignUp() {
      const s = this.registrationStatus;
      return s === 'PENDING' || s === 'REGISTERED';
    },
    orgName() {
      return this.appService?.config?.organization?.name || 'our organization';
    },
  },
  created() {
    if (this.setPageTitle) this.setPageTitle('Member');

    if (this.currentMember?.emailAddress || this.currentMember?.email) {
      this.email = this.currentMember.emailAddress || this.currentMember.email;
    }
    this.redirectTarget = this.parseRedirect?.(this.$route?.query?.redirect);

    // Centralized nav:
    // APPLIED -> Waiver; NEW -> Registration; redirect back if allowed; else Landing when canSignUp.
    if (this.isVerified && this.isAppliedRegistration) { this.routeToMemberWaiver(true); return; }
    if (this.isVerified && this.isNewRegistration) { this.routeToMemberRegistration(true); return; }
    if (this.redirectTarget && this.isVerified && this.canSignUp) { this.redirectBack?.(true); return; }
    if (!this.redirectTarget && this.isVerified && this.canSignUp) { this.routeToMemberLanding?.(true); }
  },
  unmounted() {
    if (this.setPageTitle) this.setPageTitle('');
  },
  watch: {
    currentMember() {
      // React to status changes (e.g., after submitting registration form)
      if (this.isVerified && this.isAppliedRegistration) { this.routeToMemberWaiver(); return; }
      if (this.isVerified && this.isNewRegistration) { this.routeToMemberRegistration(); return; }
      if (this.redirectTarget && this.isVerified && this.canSignUp) { this.redirectBack?.(); return; }
      if (!this.redirectTarget && this.isVerified && this.canSignUp) { this.routeToMemberLanding?.(); }
    },
  },
  methods: {
    routeToMemberLanding(replace = false) {
      const named = { name: 'MemberLanding' };
      return this.appService.withSpinner(() => replace ? this.$router.replace(named) : this.$router.push(named));
    },
    routeToMemberRegistration(replace = false) {
      const named = { name: 'MemberRegistration' };
      return this.appService.withSpinner(() => replace ? this.$router.replace(named) : this.$router.push(named));
    },
    routeToMemberWaiver(replace = false) {
      const named = { name: 'MemberWaiver', query: this.$route?.query?.redirect ? { redirect: this.$route.query.redirect } : undefined };
      return this.appService.withSpinner(() => replace ? this.$router.replace(named) : this.$router.push(named));
    },
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
      return this.appService.withSpinner(() => replace ? this.$router.replace(this.redirectTarget) : this.$router.push(this.redirectTarget));
    },

    async onRequestToken() {
      this.error = '';
      this.message = '';
      this.loading = true; // keep local loading for disabling inputs
      this.showNewAccountPrompt = false;
      await this.appService.withSpinner(async () => {
        try {
          const email = (this.email || '').trim();
          if (!email) throw new Error('Email is required');

          // Pre-check existence unless user confirmed new-account flow
          if (!this.allowAutoCreate) {
            const existing = await this.memberService.findMemberByEmail(email);
            if (!existing) {
              this.showNewAccountPrompt = true;
              this.showVerificationInputs = false; // ensure code input stays hidden for new account prompt
              this.message = '';
              return;
            }
          }

          const member = await this.memberService.requestToken(email);
          if (member && typeof member === 'object') {
            this.session.member = member;
          }
          this.message = 'If the email exists, a sign-in link or code has been sent.';
          this.showVerificationInputs = true; // show code input after sending
          this.allowAutoCreate = false; // reset after use
        } catch (e) {
          this.error = e?.message || 'Failed to request token';
          this.logger?.error?.('requestToken failed', e);
        } finally {
          this.loading = false;
        }
      });
    },

    onCorrectEmail() {
      this.showNewAccountPrompt = false;
      this.allowAutoCreate = false;
      this.showVerificationInputs = false; // hide code input while correcting email
    },

    async onConfirmCreateNew() {
      this.allowAutoCreate = true;
      await this.onRequestToken();
    },

    async onResendToken() {
      this.error = '';
      this.message = '';
      this.loading = true;
      await this.appService.withSpinner(async () => {
        try {
          await this.memberService.resendToken(this.email);
          this.message = 'Verification email resent.';
          this.showVerificationInputs = true; // keep code input visible
        } catch (e) {
          this.error = e?.message || 'Failed to resend token';
          this.logger?.error?.('resendToken failed', e);
        } finally {
          this.loading = false;
        }
      });
    },

    async onVerifyCode() {
      this.error = '';
      this.message = '';
      this.loading = true;
      // Note: we use withSpinner here, and nested calls to route/redirect also use withSpinner. 
      // This is fine as the counter handles recursive calls.
      await this.appService.withSpinner(async () => {
        try {
          const res = await this.memberService.verifyCode(this.email, this.token);

          if (res && res.success === false) {
            this.error = 'Invalid Code - Please check email code and try again';
            return;
          }

          if (res?.redirectToForm && res.url) {
            window.location.assign(res.url); // Navigation away from app
            return;
          }
          if (res?.member) {
            this.session.member = res.member;
            await nextTick();
            this.message = 'Signed in successfully.';
            this.token = '';
            this.showVerificationInputs = false; // hide after successful verification
            if (this.redirectTarget && this.canSignUp) {
              this.redirectBack();
            } else if (this.isVerified && this.isAppliedRegistration) {
              this.routeToMemberWaiver();
            } else if (this.isVerified && this.isNewRegistration) {
              this.routeToMemberRegistration();
            } else if (this.isVerified && this.canSignUp) {
              this.routeToMemberLanding();
            }
          } else {
            this.message = 'Verification complete.';
            // keep/hide based on your UX preference; hiding here:
            this.showVerificationInputs = false;
            if (this.redirectTarget && this.canSignUp) {
              this.redirectBack();
            } else if (this.isVerified && this.isAppliedRegistration) {
              this.routeToMemberWaiver();
            } else if (this.isVerified && this.isNewRegistration) {
              this.routeToMemberRegistration();
            } else if (this.isVerified && this.canSignUp) {
              this.routeToMemberLanding();
            }
          }
        } catch (e) {
          this.error = e?.message || 'Failed to verify token';
          this.logger?.error?.('verifyCode failed', e);
        } finally {
          this.loading = false;
        }
      });
    },

    async onLogout() {
      this.error = '';
      this.message = '';
      this.loading = true;
      await this.appService.withSpinner(async () => {
        try {
          await this.memberService.logout(this.currentMember?.emailAddress || this.currentMember?.email || this.email);
        } catch {
          // ignore backend logout failures
        } finally {
          this.session.member = null;
          this.message = 'Logged out.';
          this.showVerificationInputs = false; // reset UI
          this.loading = false;
        }
      });
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>