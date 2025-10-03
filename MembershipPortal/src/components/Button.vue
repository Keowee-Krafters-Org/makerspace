<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/components/Button.vue -->
<template>
  <button
    class="btn"
    :disabled="disabled"
    @click="$emit('click', $event)"
    type="button"
  >
    <span v-if="icon" class="btn-icon" aria-hidden="true">
      <Icon :name="icon" :size="iconSize" />
    </span>
    <span class="btn-label"><slot>{{ label }}</slot></span>
  </button>
</template>

<script>
import Icon from './Icon.vue';

export default {
  name: 'Button',
  components: { Icon },
  props: {
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    // Icon names mapped in Icon.vue: 'eye' | 'pencil' | 'trash' | 'users' | 'list' | 'table' | 'refresh'
    icon: { type: String, default: '' },
    iconSize: { type: [Number, String], default: 20 },
  },
  emits: ['click'],
};
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-icon {
  display: inline-flex;
}
.btn-label {
  line-height: 1;
}
</style>