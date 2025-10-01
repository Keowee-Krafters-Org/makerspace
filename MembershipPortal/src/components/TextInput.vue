<!-- filepath: /makerspace/MembershipPortal/src/components/TextInput.vue -->
<template>
  <div class="text-input-container">
    <label :for="id" class="text-input-label">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="inputType"
      :value="modelValue"
      :required="required"
      class="text-input-field"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script>
export default {
  name: 'TextInput',
  props: {
    id: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: true,
    },
    inputType: {
      type: String,
      default: 'text',
    },
    modelValue: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.text-input-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.text-input-label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151; /* Tailwind gray-700 */
}

.text-input-field {
  padding: 0.5rem;
  border: 1px solid #d1d5db; /* Tailwind gray-300 */
  border-radius: 0.375rem; /* Tailwind rounded-md */
  font-size: 1rem;
  color: #111827; /* Tailwind gray-900 */
}

.text-input-field:focus {
  outline: none;
  border-color: #2563eb; /* Tailwind blue-600 */
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); /* Tailwind focus ring */
}
</style>