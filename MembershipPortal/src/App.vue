<template>
  <div id="app">
    <header class="bg-blue-500 text-white p-4">
      <h1 class="text-xl font-bold">Membership Portal</h1>
    </header>
    <main class="p-4">
      <router-view :session="session" />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  props: {
    session: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>