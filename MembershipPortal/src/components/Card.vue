<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/components/Card.vue -->
<template>
  <div :class="['p-4 bg-white shadow rounded-lg', className]" @click="handleClick">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    className: {
      type: String,
      default: '',
    },
    onClick: {
      type: Function,
      default: null,
    },
  },
  methods: {
    handleClick(event) {
      if (this.onClick) {
        this.onClick(event);
      }
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here if needed */
</style>