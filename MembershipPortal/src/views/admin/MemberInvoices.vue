<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold">Invoices</h2>
      <button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm" @click="$router.back()">Back</button>
    </div>

    <!-- Filter -->
    <div class="mb-4 flex items-center gap-2">
      <label class="font-medium text-sm">Status:</label>
      <select v-model="filter" @change="loadInvoices" class="border rounded px-2 py-1 text-sm bg-white">
        <option value="open">Open</option>
        <option value="paid">Paid</option>
        <option value="all">All</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-50 text-red-600 p-3 rounded mb-4">
      {{ error }}
    </div>
    
    <div v-else class="bg-white rounded shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="inv in invoices" :key="inv.id || inv.invoice_id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ inv.invoice_number || inv.invoiceNumber }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ inv.date }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatCurrency(inv.total) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatCurrency(inv.balance) }}
            </td>
             <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': isPaid(inv),
                  'bg-yellow-100 text-yellow-800': isOpen(inv),
                  'bg-gray-100 text-gray-800': !isPaid(inv) && !isOpen(inv)
                }"
              >
                {{ inv.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
               <!-- If invoice_url exists use it, otherwise maybe placeholder -->
               <a v-if="inv.invoice_url" :href="inv.invoice_url" target="_blank" class="text-blue-600 hover:text-blue-900">View</a>
            </td>
          </tr>
          <tr v-if="invoices.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
              No invoices found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemberInvoices',
  inject: ['memberService'],
  props: {
    id: { type: String, required: true }
  },
  data() {
    return {
      invoices: [],
      rawInvoices: [],
      loading: false,
      error: '',
      filter: 'open'
    };
  },
  async created() {
    await this.loadInvoices();
  },
  watch: {
      id() { this.loadInvoices(); }
  },
  methods: {
    async loadInvoices() {
      this.loading = true;
      this.error = '';
      this.invoices = [];
      try {
        // Mapping UI filter to service call
        // User Spec: getInvoicesForMember(memberId, open=true)
        // Default: Open
        
        let openParam = true;
         // Pass open=true for 'open' filter. 
         // Pass open=false for 'all' or 'paid' (and filter client side if needed).
         
        if (this.filter === 'all' || this.filter === 'paid') {
            openParam = false;
        }

        const res = await this.memberService.getInvoicesForMember(this.id, openParam);
        
        let list = Array.isArray(res) ? res : (res?.data || []);
        
        if (this.filter === 'paid') {
            // Client-side filter for 'paid' since backend might return all if open=false
            list = list.filter(i => this.isPaid(i));
        }
        
        this.invoices = list;
        
      } catch (e) {
        this.error = e.message || 'Failed to load invoices';
      } finally {
        this.loading = false;
      }
    },
    isPaid(inv) {
        const s = (inv.status || '').toLowerCase();
        return s === 'paid';
    },
    isOpen(inv) {
        const s = (inv.status || '').toLowerCase();
        return s === 'sent' || s === 'overdue' || s === 'open';
    },
    formatCurrency(val) {
      if (val === undefined || val === null) return '';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
  }
};
</script>
