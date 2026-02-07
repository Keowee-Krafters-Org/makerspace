<template>
  <EntityTableRow @click="$emit('click', $event)">
    <td class="px-3 py-2">{{ user.emailAddress || '' }}</td>
    <td class="px-3 py-2">{{ (user.firstName || '') + ' ' + (user.lastName || '') }}</td>
    <td class="px-3 py-2">{{ (user.registration?.status || '') }}</td>
    <td class="px-3 py-2">{{ (user.registration?.level || '') }}</td>
    <td class="px-3 py-2 relative">
      <div class="relative inline-block text-left">
        <button
          type="button"
          class="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click.stop="toggleMenu"
        >
          <Icon name="menu" size="20" />
        </button>

        <div
          v-if="isOpen"
          :class="['absolute right-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50', openUpwards ? 'bottom-full mb-2 origin-bottom-right' : 'mt-2 origin-top-right']"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabindex="-1"
          @click.stop
        >
          <div class="py-1" role="none">
            <button
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              @click="handleAction('edit')"
            >
              <Icon name="pencil" size="16" />
              Edit
            </button>
            <button
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              @click="handleAction('invoices')"
            >
              <Icon name="document" size="16" />
              Invoices
            </button>
            <button
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              @click="handleAction('payments')"
            >
              <Icon name="currency" size="16" />
              Payments
            </button>
            <button
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              @click="handleAction('delete')"
            >
              <Icon name="trash" size="16" />
              Delete
            </button>
          </div>
        </div>
        
        <!-- Click outside overlay -->
        <div 
          v-if="isOpen" 
          class="fixed inset-0 z-40 bg-transparent" 
          @click.stop="isOpen = false"
        ></div>
      </div>
    </td>
  </EntityTableRow>
</template>

<script>
import EntityTableRow from './EntityTableRow.vue';
import Icon from './Icon.vue';

export default {
  name: 'UserTableRow',
  components: { EntityTableRow, Icon },
  props: {
    user: { type: Object, required: true },
  },
  emits: ['click', 'edit', 'invoices', 'payments', 'delete'],
  data() {
    return {
      isOpen: false,
      openUpwards: false,
    };
  },
  methods: {
    toggleMenu(event) {
      if (this.isOpen) {
        this.isOpen = false;
        return;
      }

      // Check available space below
      if (event && event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        this.openUpwards = spaceBelow < 250; // Threshold for menu height
      }

      this.isOpen = true;
    },
    handleAction(action) {
      this.$emit(action, this.user);
      this.isOpen = false;
    },
  },
};
</script>
