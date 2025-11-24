<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/components/Spinner.vue -->
<template>
  <transition name="fade">
    <div v-if="visible" class="spinner-overlay">
      <div class="spinner" aria-label="Loading" />
    </div>
  </transition>
</template>

<script>
import { inject, computed } from 'vue';

export default {
  name: 'Spinner',
  props: {
    visible: { type: Boolean, default: undefined },
  },
  setup(props) {
    const appService = inject('appService', null);
    const visible = computed(() =>
      typeof props.visible === 'boolean'
        ? props.visible
        : appService?.spinnerVisible?.value === true
    );
    return { visible };
  },
};
</script>

<style scoped>
.spinner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #3b82f6;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>