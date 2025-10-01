<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/components/Button.vue -->
<template>
  <button
    :id="id"
    :class="[
      'px-4 py-2 font-semibold text-white rounded-md transition duration-200',
      buttonClasses,
      classname
    ]"
    v-bind="ariaAttributes"
  >
    {{ label }}
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    id: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['save', 'cancel', 'next', 'back', 'default'].includes(value),
    },
    classname: {
      type: String,
      default: '',
    },
    ariaAttributes: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    buttonClasses() {
      switch (this.type) {
        case 'save':
          return 'bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-300';
        case 'cancel':
          return 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-300';
        case 'next':
          return 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300';
        case 'back':
          return 'bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:ring-gray-300';
        default:
          return 'bg-gray-300 hover:bg-gray-400 focus:ring-2 focus:ring-gray-200';
      }
    },
  },
};
</script>

<style scoped>
/* No custom styles, relying entirely on Tailwind CSS */
</style>