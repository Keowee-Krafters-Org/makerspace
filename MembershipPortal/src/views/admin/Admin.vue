<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/views/admin/Admin.vue -->
<template>
  <div class="p-4 max-w-6xl mx-auto">
    <p v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</p>

    <UserTable
      :rows="rows"
      :loading="loading"
      :page="page"
      @request-page="loadMembers"
      @edit="onEdit"
    >
      <template #search>
        <div class="relative flex items-center">
          <input
            v-model.trim="search"
            type="text"
            class="border border-gray-300 rounded pl-2 pr-8 py-1 text-sm w-48"
            placeholder="Search members..."
            @keyup.enter="onSearch"
          />
          <button
            v-if="search"
            class="absolute right-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            @click="clearSearch"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <select
          v-model="filterStatus"
          class="border border-gray-300 rounded px-2 py-1 text-sm"
          @change="onSearch"
        >
          <option value="">Status: All</option>
          <option v-for="(label, value) in registrationStatuses" :key="value" :value="value">{{ label }}</option>
        </select>
      </template>
      
      <template #actions>
        <select 
          v-model.number="page.pageSize" 
          class="border border-gray-300 rounded px-2 py-1 text-sm ml-2" 
          @change="onSearch"
          title="Page Size"
        >
          <option :value="10">10 / page</option>
          <option :value="20">20 / page</option>
          <option :value="50">50 / page</option>
        </select>
      </template>
    </UserTable>
  </div>
</template>

<script>
import { inject } from 'vue';
import UserTable from '@/components/UserTable.vue';

export default {
  name: 'AdminView',
  components: { UserTable },
  inject: ['setPageTitle', 'logger', 'memberService', 'appService'],
  data() {
    return {
      rows: [],
      error: '',
      loading: false,
      search: '',
      filterStatus: '',
      // Use Page object exclusively
      page: {
        currentPageMarker: '1',
        pageSize: 10,
        hasMore: false,
        nextPageMarker: null,
        previousPageMarker: null,
        pageToken: null,
      },
    };
  },
  created() {
    if (this.setPageTitle) this.setPageTitle('Manage Members');
    this.loadMembers();
  },
  unmounted() {
    if (this.setPageTitle) this.setPageTitle('');
  },
  computed: {
    registrationStatuses() {
      return this.appService?.config?.registration?.statuses || {};
    },
  },
  methods: {
    async loadMembers(target) {
      // Prepare pagination parameters
      let marker = this.page.currentPageMarker || '1';
      let pageSize = this.page.pageSize;

      if (target && typeof target === 'object' && target.currentPageMarker) {
        // Handle request-page event from EntityTable
        marker = target.currentPageMarker;
        if (target.pageSize) pageSize = target.pageSize;
      } else if (target === undefined || target === null) {
        // Reload current or reset (handled by initialization)
      }

      this.loading = true;
      this.error = '';
      try {
        await this.appService.withSpinner(async () => {
          // IMPORTANT: Create a clean page object for the API call
          const pageParam = {
            pageSize: pageSize,
            currentPageMarker: marker
          };

          const filters = [];
          if (this.search) {
            filters.push({ field: 'name', comparator: 'CONTAINS', value: this.search });
          }
          if (this.filterStatus) {
            filters.push({ field: 'registration.status', comparator: 'EQUALS', value: this.filterStatus });
          }

          const params = {
            page: pageParam,
            filters: filters,
          };

          const { rows, page } = await this.memberService.listMembers(params);

          this.rows = rows;
          // Normalize page state from response
          const current = String(page?.currentPageMarker ?? marker);
          const size = Number((page?.pageSize ?? pageSize ?? rows.length) || 0);
          
          // Ensure we capture the next token correctly from the response
          const nextMarker = page?.nextPageMarker ?? page?.pageToken ?? null;
          const hasMore = !!(page?.hasMore ?? (nextMarker ? true : false));

          this.page = {
            currentPageMarker: current,
            pageSize: size,
            hasMore,
            nextPageMarker: nextMarker, 
            previousPageMarker: page?.previousPageMarker ?? null,
            pageToken: nextMarker,
            totalItems: page?.totalItems,
            pageNumber: page?.pageNumber // Pass through if available
          };
        });
      } catch (e) {
        this.error = e?.message || 'Failed to load members';
        this.logger?.error?.('Admin.loadMembers', e);
      } finally {
        this.loading = false;
      }
    },
    clearSearch() {
      this.search = '';
      this.onSearch();
    },
    onSearch() {
      // reset to first page
      this.page.currentPageMarker = '1';
      this.page.nextPageMarker = null;
      this.page.previousPageMarker = null;
      this.page.pageToken = null;
      this.page.hasMore = false;
      this.loadMembers();
    },
    goToPage(pageNumber) {
      const target = Math.max(1, Number(pageNumber) || 1);
      if (this.loading) return;
      if (target > Number(this.page.currentPageMarker) && !this.page.hasMore) return;
      this.loadMembers(target);
    },
    onEdit(member) {
      this.appService.withSpinner(() => {
        if (member?.id) {
          this.$router.push({ name: 'MemberEditor', params: { id: member.id } });
        } else if (member?.emailAddress) {
          this.$router.push({ name: 'MemberEditor', query: { email: member.emailAddress } });
        } else {
          this.logger?.warn?.('No id or email to edit', member);
        }
      });
    },
  },
};
</script>

<style scoped>
.admin-view {
  padding: 1rem;
  background-color: #f9fafb; /* Tailwind gray-50 */
  border: 1px solid #e5e7eb; /* Tailwind gray-300 */
  border-radius: 0.5rem;
}
</style>