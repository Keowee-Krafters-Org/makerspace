<template>
  <div
    :id="id"
    :class="computedClasses"
    role="alert"
    @click="handleClick"
  >
    <slot>{{ message }}</slot>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: {
    id: { type: String, default: '' },
    message: { type: String, default: '' },
    type: { type: String, default: 'info' }, // info | error | warn
    className: { type: String, default: '' },
    onClick: { type: Function, default: null }
  },
  emits: ['click'],
  computed: {
    computedClasses() {
      const base = ['p-4','rounded-lg','text-sm','border','cursor-pointer','transition'];
      const map = {
        info: ['bg-blue-100','text-blue-800','border-blue-300'],
        error: ['bg-red-100','text-red-800','border-red-300'],
        warn: ['bg-yellow-100','text-yellow-800','border-yellow-300']
      };
      const variant = map[this.type] || map.info;
      if (this.className) variant.push(this.className);
      return [...base, ...variant].join(' ');
    }
  },
  methods: {
    handleClick(e) {
      if (this.onClick) this.onClick(e);
      this.$emit('click', e);
    }
  }
};
</script>
