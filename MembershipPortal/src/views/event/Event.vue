<template>
  <div :class="rootClass">
    <!-- Page header only in full page variant -->
    <header v-if="isPage" class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        {{ event?.getTitle() || 'Event' }}
      </h2>
      <div class="flex gap-2">
        <Button icon="arrow-left" label="Back" @click="goBack" />
      </div>
    </header>

    <div v-if="message" class="mb-3 p-3 rounded border border-green-300 bg-green-50 text-green-800 text-sm">
      {{ message }}
    </div>
    <div v-if="error" class="mb-3 p-3 rounded border border-red-300 bg-red-50 text-red-800 text-sm">
      {{ error }}
    </div>

    <div v-if="event" :class="bodyClass">
      <!-- Image -->
      <div :class="imageColClass">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          alt="Event"
          :class="imageClass"
        />
        <div v-else :class="placeholderClass">No image</div>
      </div>

      <!-- Details -->
      <div :class="detailsColClass">
        <h3 v-if="isCard" class="text-lg font-semibold mb-1">
          {{ event?.getTitle() }}
        </h3>

        <div class="text-gray-700 space-y-1">
          <div><span class="font-semibold">Date:</span> {{ formatDate(event.getDate()) }}</div>
          <div><span class="font-semibold">Duration:</span> {{ event.getDurationHours() }} hours</div>
          <div><span class="font-semibold">Price:</span> ${{ price }}</div>
          <div v-if="hostName"><span class="font-semibold">Host:</span> {{ hostName }}</div>
          <div v-if="locationName"><span class="font-semibold">Location:</span> {{ locationName }}</div>

          <div v-if="hasSizeLimit">
            <span class="font-semibold">Capacity:</span>
            {{ attendeesCount }} / {{ sizeLimit }}
            <span
              v-if="soldOut"
              class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
            >
              Sold out
            </span>
            <div class="text-sm text-gray-600">
              <span class="font-semibold">Spots available:</span> {{ spotsAvailable }}
            </div>
          </div>
          <div v-else>
            <span class="font-semibold">Capacity:</span> No limit
          </div>
        </div>

        <!-- Description (label + expandable, 3 lines initially) -->
        <div v-if="description" class="mt-3">
          <div class="font-semibold mb-1">Description</div>
          <div
            class="relative"
            :class="descExpanded ? '' : 'leading-6 max-h-[4.5rem] overflow-hidden'"
          >
            <p class="text-gray-800 whitespace-pre-line">
              {{ description }}
            </p>
            <div
              v-if="!descExpanded && showDescToggle"
              class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"
            />
          </div>
          <button
            v-if="showDescToggle"
            type="button"
            class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            @click="descExpanded = !descExpanded"
          >
            {{ descExpanded ? 'Show less' : 'Show more' }}
          </button>
        </div>

        <!-- Actions -->
        <div class="pt-3 flex gap-3">
          <!-- If not verified, prompt to verify and hide register/unregister -->
          <Button
            v-if="showVerifyButton"
            icon="envelope"
            label="Verify Email"
            @click="onVerify"
          />

          <!-- Otherwise show signup/unregister -->
          <template v-else>
            <Button
              v-if="!isRegistered"
              icon="user-plus"
              :disabled="soldOut || pending"
              :label="soldOut ? 'Sold Out' : (pending ? 'Working...' : 'Sign Me Up')"
              @click="onSignup"
            />
            <Button
              v-else
              icon="user-minus"
              :disabled="pending"
              :label="pending ? 'Working...' : 'Cancel my Signup'"
              @click="onUnregister"
            />
          </template>

          <Button
            v-if="isCard"
            icon="eye"
            label="Details"
            @click="openDetails"
          />
        </div>
      </div>
    </div>

    <Message v-if="error && isCard" type="error" :message="error" class="mt-3" />
  </div>
</template>

<script>
import { inject } from 'vue';
import Button from '@/components/Button.vue';
import Message from '@/components/Message.vue';
import { Event as EventModel } from '@/model/Event.js';

export default {
  name: 'EventView',
  emits: ['updated'],
  components: { Button, Message },
  props: {
    id: { type: String, required: true },
    mode: { type: String, default: 'list' },
    initial: { type: Object, default: null }, // optional pre-fetched event (for card)
    variant: { type: String, default: 'page' }, // 'page' or 'card'
  },
  data() {
    return {
      event: null,
      message: '',
      error: '',
      fromMode: this.mode === 'table' ? 'table' : 'list',
      descExpanded: false,
      pending: false,
    };
  },
  computed: {
    // Layout helpers
    isPage() { return this.variant === 'page'; },
    isCard() { return this.variant === 'card'; },
    rootClass() {
      return this.isCard
        ? 'rounded-lg border border-gray-200 shadow-sm p-4 bg-white'
        : 'p-4 max-w-4xl mx-auto';
    },
    bodyClass() {
      return this.isCard
        ? 'grid grid-cols-1 gap-3'
        : 'grid grid-cols-1 md:grid-cols-3 gap-6';
    },
    imageColClass() { return this.isCard ? '' : 'md:col-span-1'; },
    detailsColClass() { return this.isCard ? '' : 'md:col-span-2 space-y-3'; },
    imageClass() {
      return this.isCard
        ? 'w-full h-48 object-cover object-top rounded-md border border-gray-200'
        : 'w-full h-56 object-cover object-top rounded-lg border border-gray-200';
    },
    placeholderClass() {
      return this.isCard
        ? 'w-full h-48 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-gray-400'
        : 'w-full h-56 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400';
    },

    // Session-derived member info
    member() {
      return this.session?.member || null;
    },
    loginStatus() {
      return (this.member?.login?.status || '').toString().toUpperCase();
    },
    isVerified() {
      return this.loginStatus === 'VERIFIED';
    },
    isLoggedIn() {
      return !!this.member;
    },
    registrationLevel() {
      return (
        this.member?.registration?.level ||
        this.member?.level ||
        this.member?.role ||
        ''
      ).toString().toUpperCase();
    },
    // Simple rank helper if needed elsewhere
    memberRank() {
      const order = ['GUEST', 'MEMBER', 'HOST', 'INSTRUCTOR', 'MANAGER', 'ADMIN', 'OWNER'];
      const idx = order.indexOf(this.registrationLevel);
      return idx >= 0 ? idx : -1;
    },

    // Event info
    attendeesCount() { return this.event?.getAttendeeCount() ?? 0; },
    sizeLimit() { return this.event?.getSizeLimit() ?? 0; },
    hasSizeLimit() { return this.event?.hasSizeLimit() ?? false; },
    spotsAvailable() { return this.event?.getSpotsAvailable(); },
    soldOut() { return this.event?.isSoldOutFor(this.member) ?? false; },
    isRegistered() { return this.event?.isMemberRegistered(this.member) ?? false; },
    imageUrl() { return this.event?.getImageUrl() || ''; },
    hostName() { return this.event?.getHostName() || ''; },
    locationName() { return this.event?.getLocationName() || ''; },
    description() { return this.event?.eventItem?.description || this.event?.description || ''; },
    price() {
      const v = this.event?.eventItem?.price ?? this.event?.price;
      return v == null ? 0 : v;
    },

    // UI helpers
    showDescToggle() {
      const text = this.description || '';
      return text.length > 180 || text.split('\n').length > 3;
    },
    showVerifyButton() {
      // If member present and not VERIFIED, prompt to verify
      // If no member, we’ll still route to login when clicking verify
      return this.loginStatus !== 'VERIFIED';
    },
  },
  created() {
    this.eventService = inject('eventService');
    this.session = inject('session');
    this.logger = inject('logger');

    if (this.initial) {
      this.event = EventModel.fromObject(this.initial);
    } else {
      this.loadEvent();
    }
  },
  watch: {
    id() {
      if (!this.initial) this.loadEvent();
    },
  },
  methods: {
    async loadEvent() {
      this.error = '';
      try {
        const raw = await this.eventService.getEventById(this.id);
        this.event = EventModel.fromObject(raw);
      } catch (e) {
        this.error = e?.message || 'Failed to load event';
        this.logger?.error?.('getEventById failed', e);
      }
    },
    async refreshAfterChange() {
      await this.loadEvent();
      if (this.event) this.$emit('updated', this.event);
    },
    goBack() {
      this.$router.push({ path: '/event', query: { mode: this.fromMode } });
    },
    openDetails() {
      this.$router.push({ name: 'EventView', query: { id: this.id, mode: this.fromMode } });
    },
    onVerify() {
      // Send user to login/verification, then back to this event
      const target = { path: '/event/view', query: { id: this.id, mode: this.fromMode } };
      const redirect = encodeURIComponent(JSON.stringify(target));
      this.$router.push({ path: '/member', query: { redirect } });
    },

    // Require VERIFIED to register/unregister
    requireVerified() {
      return this.loginStatus !== 'VERIFIED';
    },
    redirectToLogin() {
      const target = { path: '/event/view', query: { id: this.id, mode: this.fromMode } };
      const redirect = encodeURIComponent(JSON.stringify(target));
      this.$router.push({ path: '/member', query: { redirect } });
    },

    async onSignup() {
      this.error = '';
      this.message = '';
      this.pending = true;
      try {
        const eventId = this.event?.id || this.$route?.query?.id;
        const memberId = this.session?.member?.id;
        const res = await this.eventService.signup(eventId, memberId); // no start arg
        if (res.success) {
          this.message = res.message;
          await this.refreshAfterChange();
        } else {
          this.error = res.message;
        }
      } catch (e) {
        this.error = e?.message || 'Failed to sign up for the event';
      } finally {
        this.pending = false;
      }
    },
    async onUnregister() {
      this.error = '';
      this.message = '';
      this.pending = true;
      try {
        const eventId = this.event?.id || this.$route?.query?.id;
        const memberId = this.session?.member?.id;
        const res = await this.eventService.unregister(eventId, memberId); // no start arg
        if (res?.success) {
          this.message = res?.message || 'You have been unregistered.';
          await this.refreshAfterChange();
        } else {
          this.error = res?.error || res?.message || 'Failed to unregister.';
        }
      } catch (e) {
        this.error = e?.message || 'Failed to unregister';
      } finally {
        this.pending = false;
      }
    },

    formatDate(value) {
      if (!value) return '';
      try {
        const d = typeof value === 'string' ? new Date(value) : value;
        return d.toLocaleString();
      } catch {
        return String(value);
      }
    },
  },
};
</script>