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
      @page-change="goToPage"
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
      // target may be a number (go to page), or undefined
      if (typeof target === 'number') {
        // advance using server-provided markers
        if (target > Number(this.page.currentPageMarker)) {
          // next
          const next = this.page.nextPageMarker ?? this.page.pageToken;
          // It's possible for next to be valid even if hasMore is false/undefined in some APIs,
          // but typically we rely on hasMore. If next is present, we should use it.
          if (!next && !this.page.hasMore) return;
          
          this.page.currentPageMarker = String(next ?? (Number(this.page.currentPageMarker) + 1));
        } else if (target < Number(this.page.currentPageMarker)) {
          const prev = this.page.previousPageMarker;
          if (!prev) return;
          this.page.currentPageMarker = String(prev);
        }
      }

      this.loading = true;
      this.error = '';
      try {
        await this.withSpinner(async () => {
          // IMPORTANT: Create a clean page object for the API call
          // The backend expects pageToken to be populated for next page calls if available
          const pageParam = {
            pageSize: this.page.pageSize,
            // Pass the marker we want to load. 
            // Note: Some backends use 'pageToken' for the cursor, others use 'currentPageMarker'
            // If we just advanced currentPageMarker above, we use that.
            currentPageMarker: this.page.currentPageMarker,
            pageToken: this.page.currentPageMarker // Often the token for the *requested* page
          };

          const params = {
            page: pageParam,
            search: this.search || '',
            filter: this.filterStatus || '',
          };

          const { rows, page } = await this.memberService.listMembers(params);

          this.rows = rows;
          // Normalize page state from response
          const current = String(page?.currentPageMarker ?? this.page.currentPageMarker ?? '1');
          const size = Number((page?.pageSize ?? this.page.pageSize ?? rows.length) || 0);
          
          // Ensure we capture the next token correctly from the response
          const nextMarker = page?.nextPageMarker ?? page?.pageToken ?? null;
          const hasMore = !!(page?.hasMore ?? (nextMarker ? true : false));

          this.page = {
            currentPageMarker: current,
            pageSize: size,
            hasMore,
            nextPageMarker: nextMarker, // This is the token for the *next* page
            previousPageMarker: page?.previousPageMarker ?? (Number(current) > 1 ? String(Number(current) - 1) : null),
            pageToken: nextMarker, // Store the token for the next forward navigation
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