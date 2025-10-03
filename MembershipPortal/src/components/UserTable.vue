<template>
  <div class="user-table">
    <div class="overflow-x-auto border border-gray-200 rounded-md bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-700">
          <tr>
            <th class="text-left px-3 py-2">Email</th>
            <th class="text-left px-3 py-2">Name</th>
            <th class="text-left px-3 py-2">Registration</th>
            <th class="text-left px-3 py-2">Level</th>
            <th class="text-left px-3 py-2 w-28">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="5" class="px-3 py-6 text-center text-gray-500">No members found</td>
          </tr>
          <tr
            v-for="m in rows"
            :key="m.id || m.emailAddress"
            class="border-t border-gray-100 hover:bg-gray-50"
          >
            <td class="px-3 py-2">{{ m.emailAddress || '' }}</td>
            <td class="px-3 py-2">{{ (m.firstName || '') + ' ' + (m.lastName || '') }}</td>
            <td class="px-3 py-2">{{ (m.registration?.status || '') }}</td>
            <td class="px-3 py-2">{{ (m.registration?.level || '') }}</td>
            <td class="px-3 py-2">
              <button
                class="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                @click="$emit('edit', m)"
              >
                Edit
              </button>
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="px-3 py-6 text-center text-gray-500">Loading…</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between mt-3">
      <div class="text-sm text-gray-600">
        Page {{ page.currentPage || 1 }}
      </div>
      <div class="flex gap-2">
        <button
          class="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
          :disabled="(page.currentPage || 1) <= 1 || loading"
          @click="$emit('page-change', (page.currentPage || 1) - 1)"
        >
          Previous
        </button>
        <button
          class="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
          :disabled="!page.hasMore || loading"
          @click="$emit('page-change', (page.currentPage || 1) + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserTable',
  props: {
    rows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    page: {
      type: Object,
      default: () => ({ currentPage: 1, hasMore: false }),
    },
  },
  emits: ['page-change', 'edit'],
};
</script>

<style scoped>
.user-table { }
</style>