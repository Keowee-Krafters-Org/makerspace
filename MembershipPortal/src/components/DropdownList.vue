<template>
  <div class="space-y-1">
    <select
      :value="internalValue"
      @change="onChange"
      class="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
    >
      <option :value="''">{{ emptyMessage }}</option>
      <option
        v-for="it in normalizedItems"
        :key="it.id"
        :value="it.id"
      >
        {{ it.label }}
      </option>
    </select>
    <div v-if="!normalizedItems.length" class="text-xs text-gray-500">
      No items available
    </div>
  </div>
</template>

<script>
export default {
  name: 'DropdownList',
  props: {
    listItems: { type: Array, default: () => [] },
    modelValue: { type: [String, Number, Object, null], default: '' }, // allow object with id too
    emptyMessage: { type: String, default: 'Select an option' },
    labelKeys: { type: Array, default: () => ['title','name','fullName','emailAddress','id'] },
    idKey: { type: String, default: 'id' }
  },
  emits: ['update:modelValue','change','resolved'],
  data() {
    return { internalValue: this.normalizeModel(this.modelValue) };
  },
  watch: {
    modelValue(v) {
      this.internalValue = this.normalizeModel(v);
      this.emitResolved();
    },
    listItems() {
      // When items load, validate and emit resolved selection
      this.validateSelection();
      this.emitResolved();
    }
  },
  computed: {
    normalizedItems() {
      return (this.listItems || [])
        .map(it => {
          if (!it || typeof it !== 'object') return null;
          const id = this.toStr(it[this.idKey] ?? it.id ?? it.value);
          if (!id) return null;
          const label =
            this.labelKeys.map(k => it[k]).find(v => v != null && String(v).trim().length) || id;
          return { id, label: String(label) };
        })
        .filter(Boolean);
    }
  },
  methods: {
    toStr(v) { return v == null ? '' : String(v); },
    normalizeModel(v) {
      if (v && typeof v === 'object') return this.toStr(v[this.idKey] ?? v.id);
      return this.toStr(v);
    },
    onChange(e) {
      const val = this.toStr(e.target.value);
      this.internalValue = val;
      this.$emit('update:modelValue', val || '');
      this.$emit('change', val || '');
      this.emitResolved();
    },
    validateSelection() {
      if (!this.internalValue) return;
      if (!this.normalizedItems.find(i => i.id === this.internalValue)) {
        this.internalValue = '';
        this.$emit('update:modelValue', '');
      }
    },
    emitResolved() {
      const found = this.normalizedItems.find(i => i.id === this.internalValue) || null;
      this.$emit('resolved', found);
    }
  }
};
</script>