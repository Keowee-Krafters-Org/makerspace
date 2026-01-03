<template>
  <table class="table-base">
    <thead>
      <tr class="table-head">
        <th class="th">Title</th>
        <th class="th">Start</th>
        <th class="th">End</th>
        <th class="th">Location</th>
        <th class="th">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="ev in events" :key="ev.id" class="hover:bg-gray-50">
        <td class="td">{{ ev.title || ev.name || ev.eventItem?.title }}</td>
        <td class="td">{{ formatDate(ev.startDate || ev.date) }}</td>
        <td class="td">{{ formatDate(ev.endDate) }}</td>
        <td class="td">{{ ev.location?.name || ev.location }}</td>
        <td class="td">
          <Button icon="eye" label="View" @click="$emit('select', ev)" />
          <Button icon="pencil" label="Edit" class="ml-2" @click="$emit('edit', ev)" />
          <Button icon="trash" label="Delete" class="ml-2" @click="$emit('delete', ev)" />
          <Button icon="users" label="Attendees" class="ml-2" @click="$emit('attendees', ev)" />
        </td>
      </tr>
      <tr v-if="!events?.length">
        <td class="table-empty" colspan="5">No events</td>
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