<template>
  <EntityTable
    :loading="loading"
    :page="normalizedPage"
    :isEmpty="!loading && rows.length === 0"
    :columnCount="5"
    emptyMessage="No members found"
    @request-page="$emit('request-page', $event)"
  >
    <template #search>
      <slot name="search"></slot>
    </template>
    
    <template #actions>
      <slot name="actions"></slot>
    </template>

    <template #header>
      <tr class="text-gray-700">
        <th class="text-left px-3 py-2 font-semibold">Email</th>
        <th class="text-left px-3 py-2 font-semibold">Name</th>
        <th class="text-left px-3 py-2 font-semibold">Registration</th>
        <th class="text-left px-3 py-2 font-semibold">Level</th>
        <th class="text-left px-3 py-2 w-28 font-semibold">Actions</th>
      </tr>
    </template>

    <template #body>
      <UserTableRow
        v-for="m in rows"
        :key="m.id || m.emailAddress"
        :user="m"
        class="border-t border-gray-100"
        @edit="$emit('edit', $event)"
        @invoices="$emit('invoices', $event)"
        @payments="$emit('payments', $event)"
        @delete="$emit('delete', $event)"
      />
    </template>
  </EntityTable>
</template>

<script>
import EntityTable from './EntityTable.vue';
import UserTableRow from './UserTableRow.vue';

export default {
  name: 'UserTable',
  components: { EntityTable, UserTableRow },
  props: {
    rows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    page: {
      type: Object,
      default: () => ({ currentPage: 1, hasMore: false }),
    },
  },
  emits: ['page-change', 'request-page', 'edit', 'invoices', 'payments', 'delete'],
  computed: {
    normalizedPage() {
      // UserTable uses 'currentPage' but EntityTable expects 'pageNumber' for number-based pagination
      return {
        ...this.page,
        pageNumber: this.page.currentPage || 1,
      };
    },
  },
};
</script>

