<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/views/admin/Admin.vue -->
<template>
  <div class="p-4 max-w-6xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Admin</h2>

    <div class="mb-3 flex flex-wrap items-end gap-3">
      <div>
        <label class="block text-sm font-medium mb-1">Search</label>
        <input
          v-model.trim="search"
          type="text"
          class="border border-gray-300 rounded px-3 py-2"
          placeholder="Search by email or name"
          @keyup.enter="onSearch"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Status</label>
        <select
          v-model="filterStatus"
          class="border border-gray-300 rounded px-3 py-2"
          @change="onSearch"
        >
          <option value="">All</option>
          <option value="REGISTERED">Registered</option>
          <option value="UNREGISTERED">Unregistered</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>
      <div class="ml-auto">
        <label class="block text-sm font-medium mb-1">Page Size</label>
        <select v-model.number="page.pageSize" class="border border-gray-300 rounded px-3 py-2" @change="onSearch">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</p>

    <UserTable
      :rows="rows"
      :loading="loading"
      :page="page"
      @request-page="loadMembers"
      @edit="onEdit"
    />
  </div>
</template>

<script>
import { inject } from 'vue';
import UserTable from '@/components/UserTable.vue';

export default {
  name: 'AdminView',
  components: { UserTable },
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
    this.logger = inject('logger');
    this.memberService = inject('memberService');
    this.appService = inject('appService');
    this.loadMembers();
  },
  methods: {
    async withSpinner(fn) {
      const svc = this.appService;
      if (svc && typeof svc.withSpinner === 'function') return svc.withSpinner(fn);
      return fn();
    },
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
        await this.withSpinner(async () => {
          // IMPORTANT: Create a clean page object for the API call
          const pageParam = {
            pageSize: pageSize,
            currentPageMarker: marker,
            pageToken: marker 
          };

          const params = {
            page: pageParam,
            search: this.search || '',
            filter: this.filterStatus || '',
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
      if (member?.id) {
        this.$router.push({ name: 'MemberEditor', params: { id: member.id } });
      } else if (member?.emailAddress) {
        this.$router.push({ name: 'MemberEditor', query: { email: member.emailAddress } });
      } else {
        this.logger?.warn?.('No id or email to edit', member);
      }
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