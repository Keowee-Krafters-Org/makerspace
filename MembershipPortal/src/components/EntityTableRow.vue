<template>
  <tr 
    class="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 cursor-default"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </tr>
</template>

<script>
export default {
  name: 'EntityTableRow',
  emits: ['click']
};
</script>
