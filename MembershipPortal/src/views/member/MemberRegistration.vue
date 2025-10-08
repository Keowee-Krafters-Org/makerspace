<template>
  <div class="max-w-xl mx-auto p-4">
    <h2 class="text-2xl font-semibold mb-4">Complete Your Registration</h2>

    <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
    <p v-if="message" class="mb-3 text-sm text-green-700">{{ message }}</p>

    <form v-if="member" @submit.prevent="onSubmit" class="space-y-4 bg-white border border-gray-200 rounded-md p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">First Name</label>
          <input v-model.trim="member.firstName" type="text" class="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Last Name</label>
          <input v-model.trim="member.lastName" type="text" class="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Phone Number</label>
        <input v-model.trim="member.phoneNumber" type="tel" class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Desired Membership Level</label>
        <p v-if="rateSheetLink" class="text-xs mb-1">
          See annual fees in the
          <a :href="rateSheetLink" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-800 underline">
            Membership Rate Sheet
          </a>.
        </p>
        <select v-model="member.registration.level" class="w-full border border-gray-300 rounded px-3 py-2" required>
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
            <input type="checkbox" :value="opt.value" v-model="member.interests" />
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
import { Member } from '@/model/Member.js';

export default {
  name: 'MemberRegistration',
  inject: ['session'],
  data() {
    return {
      member: null,  // Member model instance bound to the form
      saving: false,
      error: '',
      message: '',
    };
  },
  computed: {
    appService() { return this.$.appContext.provides['appService']; },
    memberService() { return this.$.appContext.provides['memberService']; },
    logger() { return this.$.appContext.provides['logger']; },
    rateSheetLink() {
      return this.appService?.config?.rateSheetLink || '';
    },
    levelOptions() {
      // Only show these three choices, with annual fees in the label
      const allowed = ['Interested Party', 'Active', 'Full Access'];
      const levels = this.appService?.config?.levels || {};
      return allowed
        .filter(label => levels[label] !== undefined)
        .map(label => {
          const v = levels[label] || {};
          const fee = typeof v.price === 'number' ? `$${v.price}/yr` : '';
          const text = fee ? `${label} — ${fee}` : label;
          return { label: text, value: label };
        });
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
    // Start from current session member but edit a clone to avoid partial writes
    const base = Member.ensure(this.currentMember);
    // Default level if empty
    if (!base.registration.level && this.levelOptions.length) {
      base.registration.level = this.levelOptions[0].value;
    }
    this.member = Member.clone(base);
  },
  methods: {
    async onSubmit() {
      this.error = '';
      this.message = '';
      this.saving = true;
      try {
        const connector = this.memberService?.connector;
        if (!connector) throw new Error('Service connector unavailable');

        const request = JSON.stringify(this.member);
        // Persist registration entry if backend requires it
        const regRun = () => connector.invoke('addMemberRegistration', request);
        try {
          const regResp = this.appService?.withSpinner ? await this.appService.withSpinner(regRun) : await regRun();
            const respObj = (typeof regResp === 'string') ? JSON.parse(regResp) : regResp;
            if (!respObj?.success) throw new Error(respObj?.message || 'Registration failed');
            const merged = Member.merge(this.currentMember, respObj.data || {});
            if (!merged) throw new Error('Failed to merge member data');
            this.session.member = merged;  // Update session member
        } catch (e) {
          // Log but do not block
          this.logger?.warn?.('addMemberRegistration failed', e);
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
      this.$router.push({ path: '/member' });
    },
  },
};
</script>

<style scoped>
/* styles */
</style>