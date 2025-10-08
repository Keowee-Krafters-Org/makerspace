<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Edit Member</h2>

    <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>
    <p v-if="message" class="text-sm text-green-700 mb-3">{{ message }}</p>

    <div v-if="loading" class="text-sm text-gray-500 mb-3">Loading…</div>

    <form v-if="member" @submit.prevent="onSave" class="space-y-4 bg-white border border-gray-200 rounded-md p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- New: ID (disabled) -->
        <div>
          <label class="block text-sm font-medium mb-1">ID</label>
          <input
            v-model="member.id"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-600"
            disabled
          />
        </div>

        <!-- Email (now disabled) -->
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model.trim="member.emailAddress"
            type="email"
            class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-600"
            disabled
          />
        </div>

        <!-- Level -->
        <div>
          <label class="block text-sm font-medium mb-1">Level</label>
          <p v-if="rateSheetLink" class="text-xs mb-1">
            See annual fees in the
            <a :href="rateSheetLink" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-800 underline">
              Membership Rate Sheet
            </a>.
          </p>
          <select
            v-model="selectedLevel"
            :key="'level-'+(member?.id || member?.emailAddress || '')"
            class="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option v-for="opt in levelOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <!-- First / Last Name -->
        <div>
          <label class="block text-sm font-medium mb-1">First Name</label>
          <input v-model.trim="member.firstName" type="text" class="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Last Name</label>
          <input v-model.trim="member.lastName" type="text" class="w-full border border-gray-300 rounded px-3 py-2" />
        </div>

        <!-- Registration Status -->
        <div>
          <label class="block text-sm font-medium mb-1">Registration Status</label>
          <select v-model="member.registration.status" class="w-full border border-gray-300 rounded px-3 py-2">
            <option value="">(none)</option>
            <option value="REGISTERED">Registered</option>
            <option value="UNREGISTERED">Unregistered</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <!-- Waiver Signed -->
        <div class="flex items-center gap-2">
          <input id="waiverSigned" v-model="member.registration.waiverSigned" type="checkbox" class="h-4 w-4" />
          <label for="waiverSigned" class="text-sm">Waiver Signed</label>
        </div>
      </div>

      <div v-if="member.registration?.waiverPdfLink" class="text-sm">
        <a :href="member.registration.waiverPdfLink" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-800">View Waiver</a>
      </div>

      <div class="flex gap-2">
        <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" :disabled="saving">Save</button>
        <button type="button" class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" @click="onCancel" :disabled="saving">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script>
import { inject } from 'vue';

export default {
  name: 'MemberEditor',
  props: { id: { type: String, default: '' }, email: { type: String, default: '' } },
  data() {
    return { member: null, loading: false, saving: false, error: '', message: '' };
  },
  computed: {
    levelOptions() {
      const levels = this.appService?.config?.levels || {};
      // Include fees in labels; store string level name as value
      return Object.entries(levels).map(([label, val]) => {
        const fee = typeof val?.price === 'number' ? `$${val.price}/yr` : '';
        const text = fee ? `${label} — ${fee}` : label;
        return { label: text, value: label };
      });
    },
    rateSheetLink() {
      return this.appService?.config?.rateSheetLink || '';
    },
    selectedLevel: {
      get() {
        const lvl = this.member?.registration?.level || '';
        const norm = s => String(s || '').trim().toLowerCase();
        const match = this.levelOptions.find(opt => norm(opt.value) === norm(lvl)) ||
                      this.levelOptions.find(opt => norm(opt.label.split(' — ')[0]) === norm(lvl));
        return match ? match.value : (lvl || (this.levelOptions[0]?.value || ''));
      },
      set(val) {
        if (this.member?.registration) this.member.registration.level = val;
      },
    },
  },
  created() {
    this.logger = inject('logger');
    this.appService = inject('appService');
    this.memberService = inject('memberService');
    this.loadMember();
  },
  methods: {
    async loadMember() {
      this.loading = true;
      this.error = '';
      try {
        this.member = this.id
          ? await this.memberService.getMemberById(this.id)
          : await this.memberService.getMemberByEmail(this.email);
      } catch (e) {
        this.error = e?.message || 'Failed to load member';
        this.logger?.error?.('MemberEditor.loadMember', e);
      } finally {
        this.loading = false;
      }
    },
    async onSave() {
      if (!this.member) return;
      this.error = '';
      this.message = '';
      this.saving = true;
      try {
        const connector = this.memberService?.connector;
        if (!connector) throw new Error('Service connector unavailable');

        const firstName = (this.member.firstName || '').trim();
        const lastName = (this.member.lastName || '').trim();
        const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (this.member.name || '');

        const request = {
          id: this.member.id,
          name,
          emailAddress: this.member.emailAddress,
          firstName,
          lastName,
          registration: {
            level: this.member.registration?.level || '',
            status: this.member.registration?.status || '',
            waiverSigned: !!this.member.registration?.waiverSigned,
            waiverPdfLink: this.member.registration?.waiverPdfLink || '',
          },
        };

        await connector.invoke('updateMember', request);
        this.message = 'Member saved.';
        this.$router.push({ path: '/admin' });
      } catch (e) {
        this.error = e?.message || 'Failed to save member';
        this.logger?.error?.('MemberEditor.onSave', e);
      } finally {
        this.saving = false;
      }
    },
    onCancel() { this.$router.back(); },
  },
};
</script>

<style scoped>
/* styles */
</style>