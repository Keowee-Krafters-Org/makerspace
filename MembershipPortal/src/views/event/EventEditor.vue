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
        <DropdownList
          v-model="selectedEventItemId"
          :list-items="eventItems"
          empty-message="Select Event Item"
          @change="applyEventItem"
        />
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
        <DropdownList
          v-model="form.location.id"
          :list-items="rooms"
          empty-message="Select Location"
        />
      </div>

      <!-- Host -->
      <div>
        <label class="block font-medium mb-1">Host</label>
        <DropdownList
          v-model="selectedHostId"
          :list-items="hosts"
          empty-message="Select Host"
          @change="applyHost"
        />
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
import DropdownList from '@/components/DropdownList.vue';

export default {
  name: 'EventEditor',
  components: { Button, Message, DropdownList },
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
  watch: {
    // Normalize and sync when hosts list loads
    hosts(newHosts) {
      this.syncSelections();
    },
    // Ensure selection sync when rooms load
    rooms() {
      this.syncSelections();
    },
    // Ensure selection sync when event items load
    eventItems() {
      this.syncSelections();
    },
  },
  methods: {
    toId(v) {
      if (v == null) return '';
      return String(v);
    },
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
          host: '',
          image: { data: '' },
        },
        date: null,
        location: { id: '' },
      };
    },

    // Resolve a host id from various shapes: {id,name,emailAddress} | 'name' | 'email' | 'id'
    resolveHostId(host) {
      if (!host) return '';
      const list = Array.isArray(this.hosts) ? this.hosts : [];

      const byId = (id) => list.find(h => String(h.id) === String(id))?.id || '';
      const byEmail = (email) => {
        const norm = String(email || '').trim().toLowerCase();
        return list.find(h => String(h.emailAddress || '').trim().toLowerCase() === norm)?.id || '';
      };
      const byName = (name) => {
        const norm = String(name || '').trim().toLowerCase();
        return list.find(h => String(h.name || '').trim().toLowerCase() === norm)?.id || '';
      };

      if (typeof host === 'object') {
        return (
          (host.id && byId(host.id)) ||
          (host.emailAddress && byEmail(host.emailAddress)) ||
          (host.name && byName(host.name)) ||
          ''
        );
      }
      // string: could be id, email, or name
      return byId(host) || byEmail(host) || byName(host) || '';
    },

    // Normalize various service response shapes to an array
    unwrapList(res, keys = []) {
      if (Array.isArray(res)) return res;
      if (!res || typeof res !== 'object') return [];
      const cands = [
        ...keys,
        'data',
        'rows',
        'list',
        'items',
        'hosts',
        'members',
        'contacts',
        'eventItems',
        'values',
        'records',
      ];
      for (const k of cands) {
        const v = res[k];
        if (Array.isArray(v)) return v;
      }
      if (Array.isArray(res.data?.rows)) return res.data.rows;
      if (Array.isArray(res.data?.list)) return res.data.list;
      return [];
    },

    async loadAll() {
      this.error = '';
      try {
        const [items, rooms, hosts] = await Promise.all([
          this.eventService.getEventItemListAll?.({ pageSize: 100 }),
          this.eventService.getEventRoomsAll?.({ pageSize: 100 }),
          this.eventService.getEventHostsAll?.({ pageSize: 100 }),
        ]);

        // Normalize IDs for dropdowns
        this.eventItems = (items || []).map(it => ({ ...it, id: String(it.id || it.itemId || it.key || '') })).filter(i => i.id);
        this.rooms = (rooms || []).map(r => ({ ...r, id: String(r.id || r.email || r.name || '') })).filter(r => r.id);
        this.hosts = (hosts || []).map(h => {
          const id = String(h.id || h.memberId || h.contactId || h.emailAddress || h.email || h.name || '');
          const name = h.name || h.fullName || [h.firstName, h.lastName].filter(Boolean).join(' ') || h.emailAddress || id;
          return id ? { ...h, id, name } : null;
        }).filter(Boolean);

        // Continue with hydrateForm + syncSelections as you already do
        if (!this.isNew) {
          const ev = await this.eventService.getEventById(this.id);
          this.hydrateForm(ev);
        } else {
          this.form = this.emptyForm();
        }
        this.syncSelections();
      } catch (e) {
        this.error = e?.message || 'Failed to load editor data';
        this.logger?.error?.('EventEditor loadAll failed', e);
      }
    },

    hydrateForm(ev) {
      this.form = {
        id: ev?.id || null,
        eventItem: {
          id: this.toId(ev?.eventItem?.id || ''),
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
        location: { id: this.toId(ev?.location?.id || '') },
      };
    },

    // remove legacy select parsing; keep applyEventItem/applyHost
    applyEventItem() {
      const id = this.toId(this.selectedEventItemId);
      const item = this.eventItems.find(i => this.toId(i.id) === id);
      if (!item) return;
      Object.assign(this.form.eventItem, {
        id,
        title: item.title || '',
        description: item.description || '',
        price: Number(item.price ?? 0),
        sizeLimit: Number(item.sizeLimit ?? 0),
        enabled: !!item.enabled,
        duration: Number(item.duration ?? 0)
      });
      // host from item
      const hostId = this.resolveHostId(item.host);
      if (hostId) {
        this.selectedHostId = hostId;
        this.applyHost();
      }
      // location
      const locId = this.toId(item.locationId || item.location?.id || '');
      if (locId) this.form.location.id = locId;
    },
    applyHost() {
      const id = this.toId(this.selectedHostId);
      const sel = this.hosts.find(h => this.toId(h.id) === id);
      this.form.eventItem.host = sel ? { id: this.toId(sel.id), name: sel.name } : '';
    },
    syncSelections() {
      // Event Item selection: ensure current form.eventItem.id matches an option
      if (this.form?.eventItem?.id && !this.selectedEventItemId) {
        const id = this.toId(this.form.eventItem.id);
        const exists = this.eventItems.some(i => this.toId(i.id) === id);
        if (exists) this.selectedEventItemId = id;
      }

      // Host selection: resolve from current host and match options
      const currentHostId = this.resolveHostId(this.form?.eventItem?.host);
      if (currentHostId) this.selectedHostId = this.toId(currentHostId);

      // Location selection: ensure id matches an option; if not try by name
      if (this.form?.location) {
        const locId = this.toId(this.form.location.id);
        if (locId) {
          const exists = this.rooms.some(r => this.toId(r.id) === locId);
          if (!exists) this.form.location.id = '';
        } else {
          // try to match by name from form/event
          const names = [
            this.form?.location?.name,
            this.form?.location?.title,
          ].filter(Boolean).map(s => s.toString().trim().toLowerCase());
          if (names.length) {
            const match = this.rooms.find(r => names.includes((r.name || r.title || '').toString().trim().toLowerCase()));
            if (match) this.form.location.id = this.toId(match.id);
          }
        }
      }
    },

    async onSave() {
      this.error = '';
      try {
        this.applyHost();

        const img = this.form.eventItem.image || {};
        const hasNewImage =
          typeof img.data === 'string' && img.data.startsWith('data:image');

        const eventItem = {
          id: this.form.eventItem.id || this.selectedEventItemId || '',
          type: 'event',
          title: this.form.eventItem.title,
          description: this.form.eventItem.description,
          price: Number(this.form.eventItem.price || 0),
          sizeLimit: Number(this.form.eventItem.sizeLimit || 0),
          enabled: !!this.form.eventItem.enabled,
          duration: Number(this.form.eventItem.duration || 0),
          host: this.form.eventItem.host || '',
          // Include image only when a new data URL is present,
          // otherwise omit so existing image stays unchanged.
          ...(hasNewImage
            ? { image: { data: img.data, name: img.name || '', contentType: img.contentType || '' } }
            : {}),
        };

        const payload = {
          id: this.form.id,
          eventItem,
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
     async getEventHosts() {
    // Calls GAS getInstructors and normalizes the result
    const raw = await this.connector.invoke('getInstructors');
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const list = Array.isArray(obj) ? obj
      : (Array.isArray(obj?.data) ? obj.data
      : (Array.isArray(obj?.rows) ? obj.rows
      : (Array.isArray(obj?.list) ? obj.list : [])));

    // Normalize to { id, name, emailAddress }
    return list.map(h => {
      const id = h.id || h.memberId || h.contactId || h.emailAddress || h.email || h.name || h.fullName || '';
      const name =
        h.name ||
        h.fullName ||
        [h.firstName, h.lastName].filter(Boolean).join(' ') ||
        h.emailAddress ||
        String(id);
      const emailAddress = h.emailAddress || h.email || '';
      return { id: String(id), name, emailAddress };
    }).filter(h => !!h.id);
  },
  },
};
</script>