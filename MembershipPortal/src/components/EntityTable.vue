<template>
  <div class="panel border border-gray-200 rounded-md bg-white overflow-visible">
    <!-- Toolbar -->
    <div class="toolbar flex flex-col sm:flex-row justify-between items-center p-3 bg-gray-50 border-b border-gray-200 gap-3 rounded-t-md">
      <div class="flex flex-1 gap-2 items-center w-full sm:w-auto">
        <slot name="search"></slot>
        <div v-if="page" class="text-sm text-gray-500 whitespace-nowrap">
          <span v-if="page.totalItems">
            {{ (historyIndex * (page.pageSize || 0)) + 1 }}-{{ Math.min((historyIndex + 1) * (page.pageSize || 0), page.totalItems) }} of {{ page.totalItems }}
          </span>
          <span v-else>
            Page {{ historyIndex + 1 }}
          </span>
        </div>
      </div>

      <div class="flex gap-2 items-center">
        <!-- Custom Actions -->
        <slot name="actions"></slot>
        
        <!-- Add Button -->
        <button
          v-if="allowAdd"
          type="button"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          :disabled="loading"
          @click="$emit('add')"
        >
          <Icon name="pencil" size="16" class="mr-1" />
          {{ addLabel }}
        </button>

        <!-- Pagination -->
        <div v-if="page" class="flex rounded-md shadow-sm">
          <button
            type="button"
            class="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            :disabled="loading || !canPrev"
            @click="onPrev"
          >
            Prev
          </button>
          <button
            type="button"
            class="relative -ml-px inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            :disabled="loading || !canNext"
            @click="onNext"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-visible">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <slot name="header"></slot>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <slot name="body"></slot>
          
          <!-- Empty State -->
          <tr v-if="isEmpty && !loading">
            <td :colspan="columnCount" class="px-6 py-4 text-center text-gray-500 text-sm">
              {{ emptyMessage }}
            </td>
          </tr>
          
          <!-- Loading State -->
          <tr v-if="loading">
             <td :colspan="columnCount" class="px-6 py-4 text-center text-gray-500 text-sm">
              Loading...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Icon from './Icon.vue';

export default {
  name: 'EntityTable',
  components: { Icon },
  props: {
    loading: { type: Boolean, default: false },
    page: { type: Object, default: null },
    allowAdd: { type: Boolean, default: false },
    addLabel: { type: String, default: 'Add' },
    isEmpty: { type: Boolean, default: false },
    emptyMessage: { type: String, default: 'No records found' },
    columnCount: { type: Number, default: 1 }, // Used for colspan on empty/loading rows
  },
  emits: ['add', 'request-page'],
  data() {
    return {
      pageHistory: [],
      historyIndex: -1,
    };
  },
  watch: {
    page: {
      immediate: true,
      handler(newPage) {
        if (!newPage) return;

        // 1. Check if we are refreshing the current page (or initial load)
        const current = this.pageHistory[this.historyIndex];
        if (current && String(current.currentPageMarker) === String(newPage.currentPageMarker)) {
          this.pageHistory[this.historyIndex] = newPage;
          return;
        }

        // 2. Check if we moved FORWARD in history (clicked "Next" into existing history)
        // Or if we moved BACKWARD in history (clicked "Prev")
        // We scan the immediate neighbors to find the new page
        
        // Check next
        if (this.historyIndex < this.pageHistory.length - 1) {
          const nextInHist = this.pageHistory[this.historyIndex + 1];
          if (String(nextInHist.currentPageMarker) === String(newPage.currentPageMarker)) {
            this.historyIndex++;
            this.pageHistory[this.historyIndex] = newPage;
            return;
          }
        }
        
        // Check prev
        if (this.historyIndex > 0) {
          const prevInHist = this.pageHistory[this.historyIndex - 1];
          if (String(prevInHist.currentPageMarker) === String(newPage.currentPageMarker)) {
             this.historyIndex--;
             this.pageHistory[this.historyIndex] = newPage;
             return;
          }
        }

        // 3. Check if this is a NEW page coming after the current one (Forward Navigation)
        if (current && String(current.nextPageMarker) === String(newPage.currentPageMarker)) {
           // We are moving forward to a new page
           this.historyIndex++;
           // If we were in the middle of history, we might be branching, but for simple pagination
           // we typically just truncate future history or append.
           this.pageHistory = this.pageHistory.slice(0, this.historyIndex);
           this.pageHistory.push(newPage);
           return;
        }

        // 4. Reset: If none of the above, it's a fresh load (Search / Filter / Reset)
        this.pageHistory = [newPage];
        this.historyIndex = 0;
      }
    }
  },
  computed: {
    canPrev() {
      // Use local history index
      return this.historyIndex > 0;
    },
    canNext() {
      // Check if current page has a next marker
      if (!this.pageHistory.length || this.historyIndex < 0) return false;
      const current = this.pageHistory[this.historyIndex];
      return !!current.nextPageMarker || !!current.hasMore;
    }
  },
  methods: {
    onPrev() {
        if (!this.canPrev) return;
        // The page can be accessed by decrimenting the pageIndex (conceptually)
        // We emit the request for the previous page's marker
        const targetPage = this.pageHistory[this.historyIndex - 1];
        this.$emit('request-page', { 
            currentPageMarker: targetPage.currentPageMarker,
            pageSize: targetPage.pageSize
        });
    },
    onNext() {
        if (!this.canNext) return;
        // next page element should be included ... based on previous page's nextPageMarker
        const current = this.pageHistory[this.historyIndex];
        this.$emit('request-page', {
            currentPageMarker: current.nextPageMarker,
            pageSize: current.pageSize
        });
    }
  }
};
</script>
