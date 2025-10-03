<template>
  <component
    v-if="IconComp"
    :is="IconComp"
    :style="{ width: sizePx, height: sizePx }"
    aria-hidden="true"
  />
</template>

<script>
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
  ListBulletIcon,
  TableCellsIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  UserMinusIcon,
  EnvelopeOpenIcon,
} from '@heroicons/vue/24/outline';

const registry = {
  eye: EyeIcon,
  pencil: PencilSquareIcon,
  trash: TrashIcon,
  users: UsersIcon,
  list: ListBulletIcon,
  table: TableCellsIcon,
  refresh: ArrowPathIcon,
  'arrow-left': ArrowLeftIcon,
  'user-plus': UserPlusIcon,
  'user-minus': UserMinusIcon,
  envelope: EnvelopeOpenIcon,
};

export default {
  name: 'Icon',
  props: {
    name: { type: String, required: true },
    size: { type: [Number, String], default: 20 }, // px or CSS size
  },
  computed: {
    IconComp() {
      return registry[this.name] || null;
    },
    sizePx() {
      return typeof this.size === 'number' ? `${this.size}px` : this.size;
    },
  },
};
</script>