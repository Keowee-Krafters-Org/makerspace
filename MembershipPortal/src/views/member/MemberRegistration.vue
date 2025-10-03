<template>
  <div class="max-w-xl mx-auto p-4">
    <h2 class="text-2xl font-semibold mb-4">Complete Your Registration</h2>

    <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mb-3 text-sm text-green-700">{{ message }}</p>

    <form @submit.prevent="onSubmit" class="space-y-4 bg-white border border-gray-200 rounded-md p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">First Name</label>
          <input v-model.trim="firstName" type="text" class="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Last Name</label>
          <input v-model.trim="lastName" type="text" class="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Phone Number</label>
        <input v-model.trim="phoneNumber" type="tel" class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Desired Membership Level</label>
        <select v-model="level" class="w-full border border-gray-300 rounded px-3 py-2" required>
          <option v-for="opt in levelOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">Choose one: Interested Party, Active, or Full Access.</p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Interests (optional)</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto border rounded p-2">
          <label v-for="opt in interestOptions" :key="opt.value" class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" :value="opt.value" v-model="selectedInterests" />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div class="flex gap-2">
        <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" :disabled="saving">
          Submit
        </button>
        <button type="button" class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" @click="onCancel" :disabled="saving">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { inject } from 'vue';

export default {
  name: 'MemberRegistration',
  inject: ['session'],
  data() {
    return {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      level: '',
      selectedInterests: [],
      saving: false,
      error: '',
      message: '',
    };
  },
  computed: {
    appService() { return this.$.appContext.provides['appService']; },
    memberService() { return this.$.appContext.provides['memberService']; },
    logger() { return this.$.appContext.provides['logger']; },
    levelOptions() {
      // Only show these three choices
      const allowed = ['Interested Party', 'Active', 'Full Access'];
      const levels = this.appService?.config?.levels || {};
      return allowed
        .map(label => ({ label, value: label }))
        .filter(opt => levels[opt.label] !== undefined);
    },
    interestOptions() {
      const interests = this.appService?.config?.interests || {};
      return Object.keys(interests).map(label => ({ label, value: label }));
    },
    currentMember() {
      return this.session?.member || {};
    },
  },
  created() {
    // Prefill from current member if available
    const m = this.currentMember || {};
    this.firstName = m.firstName || '';
    this.lastName = m.lastName || '';
    this.phoneNumber = m.phoneNumber || m.phone || '';
    this.level = (m.registration?.level || '') || (this.levelOptions[0]?.value || '');
    const selected = Array.isArray(m.interests) ? m.interests
      : (typeof m.interests === 'string' ? m.interests.split(',').map(s => s.trim()).filter(Boolean) : []);
    this.selectedInterests = selected;
  },
  methods: {
    async onSubmit() {
      this.error = '';
      this.message = '';
      this.saving = true;
      try {
        const connector = this.memberService?.connector;
        if (!connector) throw new Error('Service connector unavailable');

        const request = {
          id: this.currentMember?.id || undefined,
          emailAddress: this.currentMember?.emailAddress || '',
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim(),
          phoneNumber: this.phoneNumber.trim(),
          interests: this.selectedInterests.slice(),
          registration: {
            level: this.level,
            status: 'PENDING',
          },
        };

        const maybe = await (this.appService?.withSpinner
          ? this.appService.withSpinner(() => connector.invoke('updateMember', request))
          : connector.invoke('updateMember', request));

        // Try to use returned member if present
        let updated = maybe;
        if (typeof maybe === 'string') {
          try { updated = JSON.parse(maybe); } catch { /* ignore */ }
        }
        const member = (updated && (updated.data || updated.member)) || updated;
        if (member && typeof member === 'object') {
          this.session.member = {
            ...this.session.member,
            ...member,
            registration: {
              ...(this.session.member?.registration || {}),
              ...(member.registration || {}),
            },
          };
        } else {
          // Ensure session reflects values entered
          this.session.member = {
            ...(this.session.member || {}),
            firstName: request.firstName,
            lastName: request.lastName,
            phoneNumber: request.phoneNumber,
            interests: request.interests,
            registration: { ...(this.session.member?.registration || {}), ...request.registration },
          };
        }

        this.message = 'Registration submitted.';
        this.$router.push({ name: 'MemberLanding' });
      } catch (e) {
        this.error = e?.message || 'Failed to submit registration';
        this.logger?.error?.('MemberRegistration.onSubmit', e);
      } finally {
        this.saving = false;
      }
    },
    onCancel() {
      // Return to Member page
      this.$router.push({ path: '/member' });
    },
  },
};
</script>

<style scoped>
/* styles */
</style>