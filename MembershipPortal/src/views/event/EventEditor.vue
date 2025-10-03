<template>
  <div class="p-4 max-w-3xl mx-auto">
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">{{ isNew ? 'Create Class' : 'Edit Class' }}</h2>
      <div class="flex gap-2">
        <Button icon="refresh" label="Reload" @click="loadAll" />
        <Button icon="trash" label="Cancel" @click="onCancel" />
        <Button icon="pencil" :label="isNew ? 'Create' : 'Save'" @click="onSave" />
      </div>
    </header>

    <Message v-if="error" type="error" :message="error" class="mb-4" />

    <form @submit.prevent="onSave" class="space-y-4">
      <!-- Event Item -->
      <div>
        <label class="block font-medium mb-1">Event Item</label>
        <select
          v-model="selectedEventItemId"
          @change="applyEventItem"
          class="block w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option :value="''">Select Event Item</option>
          <option v-for="it in eventItems" :key="it.id" :value="it.id">
            {{ it.title }}
          </option>
        </select>
      </div>

      <!-- Title -->
      <div>
        <label class="block font-medium mb-1">Title</label>
        <input
          v-model="form.eventItem.title"
          type="text"
          class="block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block font-medium mb-1">Description</label>
        <textarea
          v-model="form.eventItem.description"
          rows="4"
          class="block w-full border border-gray-300 rounded-md px-3 py-2"
        ></textarea>
      </div>

      <!-- Date -->
      <div>
        <label class="block font-medium mb-1">Date</label>
        <input
          v-model="dateInput"
          type="datetime-local"
          class="block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Duration -->
        <div>
          <label class="block font-medium mb-1">Duration (hours)</label>
          <input
            v-model.number="form.eventItem.duration"
            type="number" min="0" step="0.25"
            class="block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <!-- Price -->
        <div>
          <label class="block font-medium mb-1">Price</label>
          <input
            v-model.number="form.eventItem.price"
            type="number" min="0" step="0.01"
            class="block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <!-- Size Limit -->
        <div>
          <label class="block font-medium mb-1">Attendee Limit</label>
          <input
            v-model.number="form.eventItem.sizeLimit"
            type="number" min="0"
            class="block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <!-- Enabled -->
      <div class="flex items-center gap-2">
        <input id="enabled" v-model="form.eventItem.enabled" type="checkbox" />
        <label for="enabled" class="font-medium">Enabled</label>
      </div>

      <!-- Location -->
      <div>
        <label class="block font-medium mb-1">Location</label>
        <select
          v-model="form.location.id"
          class="block w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option :value="''">Select Location</option>
          <option v-for="r in rooms" :key="r.id" :value="r.id">
            {{ r.name || r.title || r.id }}
          </option>
        </select>
      </div>

      <!-- Host -->
      <div>
        <label class="block font-medium mb-1">Host</label>
        <select
          v-model="selectedHostId"
          @change="applyHost"
          class="block w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option :value="''">Select Host</option>
          <option v-for="h in hosts" :key="h.id" :value="h.id">
            {{ h.name || h.fullName || h.emailAddress || h.id }}
          </option>
        </select>
      </div>

      <!-- Image -->
      <div>
        <label class="block font-medium mb-1">Image</label>
        <input type="file" accept="image/*" @change="onImageChange" />
        <div v-if="previewUrl" class="mt-2">
          <img :src="previewUrl" alt="Preview" class="max-h-40 rounded border" />
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { inject } from 'vue';
import Button from '@/components/Button.vue';
import Message from '@/components/Message.vue';

export default {
  name: 'EventEditor',
  components: { Button, Message },
  props: {
    id: { type: String, default: '' }, // optional route param for edit
  },
  data() {
    return {
      error: '',
      eventItems: [],
      rooms: [],
      hosts: [],
      form: this.emptyForm(),
      selectedEventItemId: '',
      selectedHostId: '',
      previewUrl: '',
      fromMode: this.$route?.query?.mode === 'table' ? 'table' : 'list',
    };
  },
  computed: {
    isNew() {
      return !this.id;
    },
    dateInput: {
      get() {
        return this.formatDateForInput(this.form.date);
      },
      set(v) {
        this.form.date = v ? new Date(v) : null;
      },
    },
  },
  created() {
    this.eventService = inject('eventService');
    this.logger = inject('logger');
    this.loadAll();
  },
  methods: {
    emptyForm() {
      return {
        id: null,
        eventItem: {
          id: '',
          type: 'event',
          title: '',
          description: '',
          price: 0,
          sizeLimit: 0,
          enabled: false,
          duration: 0,
          host: '', // string or { id, name }
          image: { data: '' },
        },
        date: null,
        location: { id: '' },
      };
    },

    async loadAll() {
      this.error = '';
      try {
        console.debug('[EventEditor] loading items/rooms/hosts...');
        const [itemsRes, roomsRes, hostsRes] = await Promise.allSettled([
          this.eventService.getEventItemList({ pageSize: 100 }),
          this.eventService.getEventRooms(),
          this.eventService.getEventHosts(),
        ]);

        const itemsVal = itemsRes.status === 'fulfilled' ? itemsRes.value : [];
        const roomsVal = roomsRes.status === 'fulfilled' ? roomsRes.value : [];
        const hostsVal = hostsRes.status === 'fulfilled' ? hostsRes.value : [];

        this.eventItems = Array.isArray(itemsVal) ? itemsVal : (itemsVal?.data || []);
        this.rooms = Array.isArray(roomsVal) ? roomsVal : (roomsVal?.data || []);
        const rawHosts = Array.isArray(hostsVal) ? hostsVal : (hostsVal?.data || []);
        this.hosts = rawHosts
          .map(h => ({
            id: h.id || h.memberId || h.emailAddress || h.email || h.name || h.fullName,
            name:
              h.name ||
              h.fullName ||
              [h.firstName, h.lastName].filter(Boolean).join(' ') ||
              h.emailAddress ||
              h.email ||
              String(h.id || ''),
            emailAddress: h.emailAddress || h.email || '',
          }))
          .filter(h => !!h.id);

        console.debug('[EventEditor] hosts loaded:', this.hosts.length);

        if (!this.isNew) {
          const ev = await this.eventService.getEventById(this.id);
          this.hydrateForm(ev);
          this.selectedEventItemId = ev?.eventItem?.id || '';
          this.previewUrl = ev?.eventItem?.image?.url || '';
          const host = ev?.eventItem?.host;
          if (host && typeof host === 'object' && host.id) {
            this.selectedHostId = host.id;
          } else if (host && typeof host === 'string') {
            const found = this.hosts.find(h => h.name === host);
            this.selectedHostId = found?.id || '';
          } else {
            this.selectedHostId = '';
          }
        } else {
          this.form = this.emptyForm();
          this.selectedEventItemId = '';
          this.selectedHostId = '';
          this.previewUrl = '';
        }
      } catch (e) {
        this.error = e?.message || 'Failed to load editor data';
        this.logger?.error?.('EventEditor loadAll failed', e);
      }
    },

    hydrateForm(ev) {
      this.form = {
        id: ev?.id || null,
        eventItem: {
          id: ev?.eventItem?.id || '',
          type: 'event',
          title: ev?.eventItem?.title || ev?.title || '',
          description: ev?.eventItem?.description || ev?.description || '',
          price: Number(ev?.eventItem?.price ?? ev?.price ?? 0),
          sizeLimit: Number(ev?.eventItem?.sizeLimit ?? ev?.sizeLimit ?? 0),
          enabled: !!(ev?.eventItem?.enabled ?? ev?.enabled),
          duration: Number(ev?.eventItem?.duration ?? ev?.duration ?? 0),
          host: ev?.eventItem?.host ?? '',
          image: { data: '' },
        },
        date: ev?.date ? new Date(ev.date) : null,
        location: { id: ev?.location?.id || '' },
      };
    },

    applyEventItem() {
      const item = this.eventItems.find(i => i.id === this.selectedEventItemId);
      if (!item) return;
      this.form.eventItem.id = item.id;
      this.form.eventItem.title = item.title || '';
      this.form.eventItem.description = item.description || '';
      this.form.eventItem.price = Number(item.price ?? 0);
      this.form.eventItem.sizeLimit = Number(item.sizeLimit ?? 0);
      this.form.eventItem.enabled = !!item.enabled;
      this.form.eventItem.duration = Number(item.duration ?? 0);
      if (item.host) {
        const hostId = typeof item.host === 'object' ? item.host.id : '';
        if (hostId) this.selectedHostId = hostId;
      }
      this.previewUrl = item?.image?.url || '';
    },

    applyHost() {
      const sel = this.hosts.find(h => h.id === this.selectedHostId);
      this.form.eventItem.host = sel ? { id: sel.id, name: sel.name } : '';
    },

    async onSave() {
      this.error = '';
      try {
        this.applyHost();
        const payload = {
          id: this.form.id,
          eventItem: {
            id: this.form.eventItem.id || this.selectedEventItemId || '',
            type: 'event',
            title: this.form.eventItem.title,
            description: this.form.eventItem.description,
            price: Number(this.form.eventItem.price || 0),
            sizeLimit: Number(this.form.eventItem.sizeLimit || 0),
            enabled: !!this.form.eventItem.enabled,
            duration: Number(this.form.eventItem.duration || 0),
            host: this.form.eventItem.host || '',
            image: { data: this.form.eventItem.image?.data || '' },
          },
          date: this.form.date ? new Date(this.form.date) : null,
          location: { id: this.form.location.id || '' },
        };

        await this.eventService.saveEvent(payload);
        this.$router.push({ path: '/event', query: { mode: this.fromMode } });
      } catch (e) {
        this.error = e?.message || 'Failed to save event';
        this.logger?.error?.('EventEditor save failed', e);
      }
    },

    onCancel() {
      this.$router.push({ path: '/event', query: { mode: this.fromMode } });
    },

    onImageChange(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = String(reader.result).split(',')[1] || '';
        this.form.eventItem.image = { data: base64 };
        this.previewUrl = URL.createObjectURL(file);
      };
      reader.readAsDataURL(file);
    },

    formatDateForInput(date) {
      if (!date) return '';
      try {
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      } catch {
        return '';
      }
    },
  },
};
</script>