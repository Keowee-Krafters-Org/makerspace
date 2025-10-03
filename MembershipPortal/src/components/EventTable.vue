<template>
  <table class="min-w-full border-collapse">
    <thead>
      <tr class="bg-gray-100">
        <th class="text-left p-2 border">Title</th>
        <th class="text-left p-2 border">Start</th>
        <th class="text-left p-2 border">End</th>
        <th class="text-left p-2 border">Location</th>
        <th class="text-left p-2 border">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="ev in events" :key="ev.id" class="hover:bg-gray-50">
        <td class="p-2 border">{{ ev.title || ev.name || ev.eventItem?.title }}</td>
        <td class="p-2 border">{{ formatDate(ev.startDate || ev.date) }}</td>
        <td class="p-2 border">{{ formatDate(ev.endDate) }}</td>
        <td class="p-2 border">{{ ev.location?.name || ev.location }}</td>
        <td class="p-2 border">
          <Button icon="eye" label="View" @click="$emit('select', ev)" />
          <Button icon="pencil" label="Edit" class="ml-2" @click="$emit('edit', ev)" />
          <Button icon="trash" label="Delete" class="ml-2" @click="$emit('delete', ev)" />
          <Button icon="users" label="Attendees" class="ml-2" @click="$emit('attendees', ev)" />
        </td>
      </tr>
      <tr v-if="!events?.length">
        <td class="p-4 text-center text-gray-500 border" colspan="5">No events</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import Button from './Button.vue';

export default {
  name: 'EventTable',
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