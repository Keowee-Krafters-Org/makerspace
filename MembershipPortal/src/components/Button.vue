<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/components/Button.vue -->
<template>
  <button
    :class="computedClass"
    :disabled="disabled"
    type="button"
    @click="$emit('click', $event)"
  >
    <span v-if="icon" class="inline-flex" aria-hidden="true">
      <Icon :name="icon" :size="iconSize" />
    </span>
    <span class="leading-none"><slot>{{ label }}</slot></span>
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
    icon: { type: String, default: '' },
    iconSize: { type: [Number, String], default: 20 },
    type: { type: String, default: 'default' },       // save | cancel | next | back | default
    classname: { type: String, default: '' }          // extra custom classes (tests use 'classname')
  },
  emits: ['click'],
  computed: {
    computedClass() {
      const base = [
        'px-4','py-2','font-semibold','text-white',
        'rounded-md','transition','duration-200',
        'focus:outline-none','focus:ring-2'
      ];
      if (this.disabled) base.push('opacity-50','cursor-not-allowed');

      const map = {
        save: ['bg-green-500','hover:bg-green-600','focus:ring-green-300'],
        cancel: ['bg-red-500','hover:bg-red-600','focus:ring-red-300'],
        next: ['bg-blue-500','hover:bg-blue-600','focus:ring-blue-300'],
        back: ['bg-gray-500','hover:bg-gray-600','focus:ring-gray-300'],
        default: ['bg-gray-300','hover:bg-gray-400','focus:ring-gray-200']
      };
      const variant = map[this.type] || map.default;
      return [...base, ...variant, this.classname].filter(Boolean).join(' ');
    }
  }
};
</script>