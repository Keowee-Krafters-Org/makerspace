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
        <select v-model.number="pageSize" class="border border-gray-300 rounded px-3 py-2" @change="onSearch">
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
      :page="{ currentPage, hasMore }"
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
      currentPage: 1,
      pageSize: 10,
      hasMore: false,
      cursorMode: false,
      nextToken: null,
      prevTokens: [],
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
    async loadMembers(arg) {
      if (typeof arg === 'number') this.currentPage = arg;
      if (arg && typeof arg === 'object' && arg.currentPage) this.currentPage = arg.currentPage;

      this.loading = true;
      this.error = '';
      try {
        await this.withSpinner(async () => {
          const params = {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            search: this.search || '',
            filter: this.filterStatus || '',
          };
          // cursor back/forward
          if (this.cursorMode) {
            if (typeof arg === 'number' && arg > this.currentPage && this.nextToken) {
              params.pageToken = this.nextToken;
            } else if (typeof arg === 'number' && arg < this.currentPage && this.prevTokens.length) {
              params.pageToken = this.prevTokens.pop();
            }
          }

          const { rows, page, cursorMode } = await this.memberService.listMembers(params);

          // maintain token stack if using cursor mode (backend puts nextToken in page.nextToken)
          this.cursorMode = cursorMode;
          if (cursorMode) {
            if (typeof arg === 'number' && arg > this.currentPage && this.nextToken) {
              this.prevTokens.push(this.nextToken);
            }
            this.nextToken = page.nextToken || null;
          }

          this.rows = rows;
          this.currentPage = page.currentPage || this.currentPage || 1;
          this.hasMore = !!page.hasMore;
        });
      } catch (e) {
        this.error = e?.message || 'Failed to load members';
        this.logger?.error?.('Admin.loadMembers', e);
      } finally {
        this.loading = false;
      }
    },
    onSearch() {
      this.currentPage = 1;
      this.cursorMode = false;
      this.nextToken = null;
      this.prevTokens = [];
      this.loadMembers(1);
    },
    goToPage(pageNumber) {
      const target = Math.max(1, Number(pageNumber) || 1);
      if (this.loading) return;
      if (target > this.currentPage && !this.hasMore) return;
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