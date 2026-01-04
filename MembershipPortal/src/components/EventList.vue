<template>
  <ul class="divide-y">
    <li
      v-for="ev in events"
      :key="ev.id"
      class="py-3 flex items-center justify-between"
    >
      <div>
        <div class="font-semibold">{{ ev.title || ev.name }}</div>
        <div class="text-sm text-gray-600">
          {{ formatDate(ev.date) }}
          <span v-if="ev.endDate"> - {{ formatDate(ev.endDate) }}</span>
          <span v-if="ev.location"> • {{ ev.location }}</span>
        </div>
      </div>
      <div class="flex gap-2">
        <Button label="View" @click="$emit('select', ev)" />
        <Button label="Edit" @click="$emit('edit', ev)" />
        <Button label="Delete" @click="$emit('delete', ev)" />
      </div>
    </li>
    <li v-if="!events?.length" class="py-6 text-center text-gray-500">No events</li>
  </ul>
</template>

<script>
import Button from './Button.vue';

export default {
  name: 'EventList',
  components: { Button },
  props: {
    events: { type: Array, default: () => [] },
  },
  methods: {
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