<template>
  <div id="app">
    <router-view />
    <Spinner />
  </div>
</template>

<script>
import Spinner from '@/components/Spinner.vue';
export default {
  name: 'App',
  components: { Spinner },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>