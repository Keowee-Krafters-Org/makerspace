<template>
  <div
    :id="id"
    :class="[
      'p-4 rounded-lg text-sm',
      className,
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : '',
      type === 'warn' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : '',
      type === 'info' ? 'bg-blue-100 text-blue-800 border border-blue-300' : ''
    ]"
    @click="handleClick"
  >
    {{ message }}
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: {
    id: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'info', // Default type is 'info'
      validator: (value) => ['info', 'error', 'warn'].includes(value),
    },
    onClick: {
      type: Function,
      default: null,
    },
  },
  methods: {
    handleClick() {
      if (this.onClick) {
        this.onClick();
      }
    },
  },
};
</script>

<style scoped>

</style>
