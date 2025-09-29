<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/components/Spinner.vue -->
<template>
  <div v-if="visible" class="spinner-overlay">
    <div class="spinner"></div>
  </div>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 6px solid #e5e7eb; /* Tailwind gray-300 */
  border-top-color: #2563eb; /* Tailwind blue-600 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>