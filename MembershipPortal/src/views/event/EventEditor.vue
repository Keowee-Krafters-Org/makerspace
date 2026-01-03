<template>
  <div class="p-4 max-w-3xl mx-auto">
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">{{ isNew ? 'Create Class' : 'Edit Class' }}</h2>
      <div class="toolbar-actions">
        <Button icon="refresh" label="Reload" @click="loadAll" />
        <Button icon="trash" label="Cancel" @click="onCancel" />
        <Button icon="pencil" :label="isNew ? 'Create' : 'Save'" @click="onSave" />
      </div>
    </header>

    <Message v-if="error" type="error" :message="error" class="mb-4" />

    <form @submit.prevent="onSave">
      <div class="form-group">
        <label class="form-label">Event Item</label>
        <DropdownList
          v-model="selectedEventItemId"
          :list-items="eventItems"
          :value-prop="'value'"
          :label-prop="'label'"
          empty-message="Select Event Item"
          @change="applyEventItem"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Title</label>
        <input v-model="form.eventItem.title" type="text" class="form-input" />
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea v-model="form.eventItem.description" rows="4" class="form-textarea class-desc"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Date</label>
        <input v-model="dateInput" type="datetime-local" class="form-input" />
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Duration (hours)</label>
          <input v-model.number="form.eventItem.duration" type="number" min="0" step="0.25" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Price</label>
          <input v-model.number="form.eventItem.price" type="number" min="0" step="0.01" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Attendee Limit</label>
          <input v-model.number="form.eventItem.sizeLimit" type="number" min="0" class="form-input" />
        </div>
      </div>

      <div class="form-group">
        <label class="inline-flex items-center gap-2">
          <input id="enabled" v-model="form.eventItem.enabled" type="checkbox" class="form-checkbox" />
          <span class="form-label mb-0">Enabled</span>
        </label>
      </div>

      <div class="form-group">
        <label class="form-label">Location</label>
        <DropdownList
          v-model="form.location.id"
          :list-items="rooms"
          :value-prop="'value'"
          :label-prop="'label'"
          empty-message="Select Location"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Host</label>
        <DropdownList
          v-model="selectedHostId"
          :list-items="hosts"
          :value-prop="'value'"
          :label-prop="'label'"
          empty-message="Select Host"
          @change="applyHost"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Image</label>
        <div class="flex items-center gap-2">
          <input v-model="form.eventItem.image.url" type="text" class="form-input" placeholder="Image URL" />
          <Button @click="triggerImageInput">Choose File</Button>
        </div>
        <input ref="imageInput" type="file" accept="image/*" @change="onImageChange" class="hidden" />
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
import { Logger }  from '@/services/Logger.js';

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
    hosts() { this.syncSelections(); },
    rooms() { this.syncSelections(); },
    eventItems() { this.syncSelections(); },
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
          host: { id: '' },
          image: { data: '' },
        },
        date: null,
        location: { id: '' },
      };
    },

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
      return byId(host) || byEmail(host) || byName(host) || '';
    },

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
        Logger.debug('EventEditor loading all reference data');
        const [items, rooms, hosts] = await Promise.all([
          this.eventService.getEventItemList?.({ page: { pageSize: 100 } }),
          this.eventService.getEventRooms?.({ page: { pageSize: 100 } }),
          this.eventService.getEventHosts?.({ page: { pageSize: 100 } }),
        ]);

        // Event Items -> { value, label, id, ... }
        this.eventItems = (items?.data || [])
          .map(it => {
            const id = String(it.id || it.itemId || it.key || '');
            const title = it.title || it.eventItem?.title || '';
            return id ? { ...it, id, value: id, label: title || id } : null;
          })
          .filter(Boolean);

        // Rooms -> { value, label, email }  // keep email for saving and display
        this.rooms = (rooms?.data || [])
          .map(r => {
            const id = String(r.id || r.email || r.name || '');
            const email = String(r.email || r.address || r.calendarEmail || '');
            const label = r.name || r.title || email || id;
            return id ? { ...r, id, value: id, label, email } : null;
          })
          .filter(Boolean);

        // Hosts -> { value, label }
        this.hosts = (hosts?.data || [])
          .map(h => {
            const id = String(h.id);
            const name =  [h.firstName, h.lastName].filter(Boolean).join(' ');
            return id ? { ...h, id, name, value: id, label: name } : null;
          })
          .filter(Boolean);

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
      // keep location email from event or resolve from rooms list
      const locId = this.toId(ev?.location?.id || '');
      const locEmailFromEvent = ev?.location?.email || ev?.location?.address || '';
      const locMatch = this.rooms.find(r => this.toId(r.id) === locId) || null;
      const locEmail = locEmailFromEvent || locMatch?.email || '';

      const imgUrl = ev?.eventItem?.image?.url || ev?.image?.url || '';

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
          image: { data: '', url: imgUrl },
        },
        date: ev?.date ? new Date(ev.date) : null,
        location: { id: locId, email: locEmail },
      };

      this.previewUrl = imgUrl;
    },

    applyEventItem() {
      const id = this.toId(this.selectedEventItemId);
      const item = this.eventItems.find(i => this.toId(i.id) === id);
      if (!item) return;
      Object.assign(this.form.eventItem, {
        id,
        title: item.title || item.label || '',
        description: item.description || '',
        price: Number(item.price ?? 0),
        sizeLimit: Number(item.sizeLimit ?? 0),
        enabled: !!item.enabled,
        duration: Number(item.duration ?? 0),
      });
      const hostId = this.resolveHostId(item.host);
      if (hostId) {
        this.selectedHostId = hostId;
        this.applyHost();
      }
      const locId = this.toId(item.locationId || item.location?.id || '');
      if (locId) {
        const locMatch = this.rooms.find(r => this.toId(r.id) === locId);
        this.form.location.id = locId;
        this.form.location.email = locMatch?.email || this.form.location.email || '';
      }
    },

    applyHost() {
      const id = this.toId(this.selectedHostId);
      const sel = this.hosts.find(h => this.toId(h.id) === id || this.toId(h.value) === id);
      this.form.eventItem.host = sel ? { id: this.toId(sel.id), name: sel.name || sel.label } : '';
    },

    syncSelections() {
      if (this.form?.eventItem?.id && !this.selectedEventItemId) {
        const id = this.toId(this.form.eventItem.id);
        const exists = this.eventItems.some(i => this.toId(i.id) === id || this.toId(i.value) === id);
        if (exists) this.selectedEventItemId = id;
      }
      const currentHostId = this.resolveHostId(this.form?.eventItem?.host);
      if (currentHostId) this.selectedHostId = this.toId(currentHostId);

      if (this.form?.location) {
        const locId = this.toId(this.form.location.id);
        if (locId) {
          const match = this.rooms.find(r => this.toId(r.id) === locId || this.toId(r.value) === locId);
          if (match) {
            // ensure email is retained from rooms when present
            this.form.location.email = match.email || this.form.location.email || '';
          } else {
            this.form.location.id = '';
            this.form.location.email = '';
          }
        } else {
          // try matching by name/title to get email if id is missing
          const names = [
            this.form?.location?.name,
            this.form?.location?.title,
          ].filter(Boolean).map(s => s.toString().trim().toLowerCase());
          if (names.length) {
            const match = this.rooms.find(r => names.includes((r.name || r.title || r.label || '').toString().trim().toLowerCase()));
            if (match) {
              this.form.location.id = this.toId(match.id);
              this.form.location.email = match.email || '';
            }
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
          ...(hasNewImage
            ? { image: { data: img.data, name: img.name || '', contentType: img.contentType || '' } }
            : (img.url ? { image: { url: img.url } } : {})),
        };

        // ensure location.email is saved
        const locationEmail = this.form.location.email
          || this.rooms.find(r => this.toId(r.id) === this.toId(this.form.location.id))?.email
          || '';

        const payload = {
          id: this.form.id,
          eventItem,
          date: this.form.date ? new Date(this.form.date) : null,
          location: { id: this.form.location.id || '', email: locationEmail },
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

    triggerImageInput() {
      this.$refs.imageInput.click();
    },

    onImageChange(ev) {
      try {
        const file = ev.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          this.form.eventItem.image = {
            data: String(dataUrl || ''),
            name: file.name || '',
            contentType: file.type || '',
          };
          this.previewUrl = String(dataUrl || '');
        };
        reader.readAsDataURL(file);
      } catch {}
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

    // Legacy helper kept for reference; not used by EventEditor after refactor
    async getEventHosts() {
      const raw = await this.connector.invoke('getInstructors');
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;

      const list = Array.isArray(obj) ? obj
        : (Array.isArray(obj?.data) ? obj.data
        : (Array.isArray(obj?.rows) ? obj.rows
        : (Array.isArray(obj?.list) ? obj.list : [])));

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

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
}

.form-textarea {
  resize: vertical;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.class-desc {
  height: 100px;
}
</style>