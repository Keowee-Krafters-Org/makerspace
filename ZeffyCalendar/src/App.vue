<template>
  <div id="app" class="p-4">
    <Calendar />
  </div>
</template>

<script>
import Calendar from './components/Calendar.vue';

export default {
  name: 'App',
  components: {
    Calendar,
  },
};
</script>