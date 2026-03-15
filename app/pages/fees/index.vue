<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Fee Management</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage fee structures, invoices and payments</p>
            </div>
            <div class="flex gap-2">
                <button @click="activeTab = 'defaulters'"
                    :class="['px-3 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === 'defaulters' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50']">
                    Defaulters
                </button>
                <button @click="openCreateInvoice"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" /> New Invoice
                </button>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 mb-1">Total Invoiced</p>
                <p class="text-2xl font-bold text-gray-900">৳{{ formatMoney(stats.total_invoiced) }}</p>
            </div>
            <div class="bg-green-50 rounded-xl border border-green-200 p-4">
                <p class="text-xs text-gray-400 mb-1">Collected</p>
                <p class="text-2xl font-bold text-green-600">৳{{ formatMoney(stats.total_collected) }}</p>
                <p class="text-xs text-green-500 mt-0.5">Today: ৳{{ formatMoney(stats.collected_today) }}</p>
            </div>
            <div class="bg-red-50 rounded-xl border border-red-200 p-4">
                <p class="text-xs text-gray-400 mb-1">Pending</p>
                <p class="text-2xl font-bold text-red-600">৳{{ formatMoney(stats.total_pending) }}</p>
                <p class="text-xs text-red-500 mt-0.5">{{ stats.overdue_count || 0 }} overdue</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 mb-2">By Status</p>
                <div class="space-y-1">
                    <div class="flex justify-between text-xs"><span class="text-green-600">Paid</span><span
                            class="font-medium">{{ stats.paid_count || 0 }}</span></div>
                    <div class="flex justify-between text-xs"><span class="text-yellow-600">Partial</span><span
                            class="font-medium">{{ stats.partial_count || 0 }}</span></div>
                    <div class="flex justify-between text-xs"><span class="text-red-600">Unpaid</span><span
                            class="font-medium">{{ stats.unpaid_count || 0 }}</span></div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                :class="['px-4 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']">
                {{ tab.label }}
            </button>
        </div>

        <!-- ── INVOICES TAB ── -->
        <div v-if="activeTab === 'invoices'" class="space-y-4">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <div class="flex flex-wrap gap-3">
                    <div class="flex-1 min-w-48 relative">
                        <UIcon name="i-heroicons-magnifying-glass"
                            class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input v-model="invoiceFilters.search" @input="debouncedFetchInvoices" type="search"
                            autocomplete="new-password" placeholder="Search student name or invoice no..."
                            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                    </div>
                    <select v-model="invoiceFilters.status" @change="fetchInvoices"
                        class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                        <option value="">All Status</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                    </select>
                    <select v-model="invoiceFilters.fee_type" @change="fetchInvoices"
                        class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                        <option value="">All Types</option>
                        <option value="tuition">Tuition</option>
                        <option value="lab">Lab</option>
                        <option value="library">Library</option>
                        <option value="exam">Exam</option>
                        <option value="admission">Admission</option>
                        <option value="transport">Transport</option>
                        <option value="misc">Misc</option>
                    </select>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div v-if="loadingInvoices" class="p-8 text-center">
                    <div
                        class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                    </div>
                </div>
                <table v-else class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                                Student</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Type</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            <th
                                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Paid</th>
                            <th
                                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                                Due</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                                Due Date</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-gray-50">
                            <td class="px-4 py-3">
                                <p class="text-xs font-mono font-medium text-indigo-700">{{ inv.invoice_number }}</p>
                                <p class="text-xs text-gray-400">{{ inv.semester }}</p>
                            </td>
                            <td class="px-4 py-3 hidden sm:table-cell">
                                <div class="flex items-center gap-2">
                                    <img :src="inv.student?.avatar_url" class="w-6 h-6 rounded-full object-cover" />
                                    <div>
                                        <p class="text-xs font-medium text-gray-900">{{ inv.student?.name }}</p>
                                        <p class="text-xs font-mono text-gray-400">{{ inv.student?.student_id }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3 hidden md:table-cell">
                                <span
                                    :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', feeTypeColor(inv.fee_type)]">{{
                                        inv.fee_type }}</span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <span class="text-sm font-bold text-gray-900">৳{{ formatMoney(inv.net_amount) }}</span>
                            </td>
                            <td class="px-4 py-3 text-right hidden md:table-cell">
                                <span class="text-sm font-medium text-green-600">৳{{ formatMoney(inv.paid_amount)
                                }}</span>
                            </td>
                            <td class="px-4 py-3 text-right hidden lg:table-cell">
                                <span
                                    :class="['text-sm font-bold', inv.due_amount > 0 ? 'text-red-600' : 'text-gray-400']">৳{{
                                        formatMoney(inv.due_amount) }}</span>
                            </td>
                            <td class="px-4 py-3 hidden lg:table-cell">
                                <span
                                    :class="['text-xs', isOverdue(inv) ? 'text-red-600 font-medium' : 'text-gray-500']">{{
                                        inv.due_date }}</span>
                            </td>
                            <td class="px-4 py-3">
                                <span
                                    :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', statusColor(inv.status)]">{{
                                        inv.status }}</span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <button v-if="inv.status !== 'paid' && inv.status !== 'waived'"
                                    @click="openPayment(inv)"
                                    class="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                                    Collect
                                </button>
                            </td>
                        </tr>
                        <tr v-if="!invoices.length">
                            <td colspan="9" class="px-4 py-12 text-center text-gray-400 text-sm">No invoices found</td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="invoicePagination.last_page > 1"
                    class="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                    <p class="text-sm text-gray-500">{{ invoicePagination.total }} total</p>
                    <div class="flex gap-1">
                        <button @click="changeInvoicePage(invoicePagination.current_page - 1)"
                            :disabled="invoicePagination.current_page === 1"
                            class="px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40">‹</button>
                        <button v-for="p in invoicePageNumbers" :key="p" @click="changeInvoicePage(p)"
                            :class="['px-3 py-1 text-sm rounded', p === invoicePagination.current_page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100']">{{
                                p }}</button>
                        <button @click="changeInvoicePage(invoicePagination.current_page + 1)"
                            :disabled="invoicePagination.current_page === invoicePagination.last_page"
                            class="px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40">›</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── STRUCTURES TAB ── -->
        <div v-if="activeTab === 'structures'" class="space-y-4">
            <div class="flex justify-between items-center">
                <p class="text-sm text-gray-500">Define fee amounts per type</p>
                <button @click="openCreateStructure"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Structure
                </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="fs in structures" :key="fs.id"
                    class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize mb-1', feeTypeColor(fs.fee_type)]">{{
                                    fs.fee_type }}</span>
                            <h3 class="text-sm font-bold text-gray-900">{{ fs.name }}</h3>
                            <p v-if="fs.program" class="text-xs text-gray-400 mt-0.5">{{ fs.program?.name }}</p>
                        </div>
                        <div class="flex gap-1">
                            <button @click="openEditStructure(fs)"
                                class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                            </button>
                            <button @click="deleteStructure(fs)"
                                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-3 border-t border-gray-50">
                        <p class="text-2xl font-bold text-gray-900">৳{{ formatMoney(fs.amount) }}</p>
                        <div class="flex items-center gap-2">
                            <span v-if="fs.is_mandatory"
                                class="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Mandatory</span>
                            <span
                                :class="['text-xs px-2 py-0.5 rounded-full', fs.status === 'active' ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100']">{{
                                    fs.status }}</span>
                        </div>
                    </div>
                </div>
                <div v-if="!structures.length" class="col-span-3 text-center py-12 text-gray-400 text-sm">No fee
                    structures defined yet</div>
            </div>
        </div>

        <!-- ── DEFAULTERS TAB ── -->
        <div v-if="activeTab === 'defaulters'" class="space-y-4">
            <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 shrink-0" />
                <p class="text-sm text-red-700">Students with overdue invoices past due date</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div v-if="loadingDefaulters" class="p-8 text-center">
                    <div class="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto">
                    </div>
                </div>
                <table v-else class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                                Invoice</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Type</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Due Amount
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="inv in defaulters" :key="inv.id" class="hover:bg-red-50/30">
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-2">
                                    <img :src="inv.student?.avatar_url" class="w-7 h-7 rounded-full object-cover" />
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">{{ inv.student?.name }}</p>
                                        <p class="text-xs font-mono text-gray-400">{{ inv.student?.student_id }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3 hidden sm:table-cell">
                                <p class="text-xs font-mono text-indigo-700">{{ inv.invoice_number }}</p>
                            </td>
                            <td class="px-4 py-3 hidden md:table-cell">
                                <span
                                    :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', feeTypeColor(inv.fee_type)]">{{
                                        inv.fee_type }}</span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <span class="text-sm font-bold text-red-600">৳{{ formatMoney(inv.due_amount) }}</span>
                            </td>
                            <td class="px-4 py-3">
                                <span class="text-xs text-red-600 font-medium">{{ inv.due_date }}</span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <button @click="openPayment(inv)"
                                    class="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Collect</button>
                            </td>
                        </tr>
                        <tr v-if="!defaulters.length">
                            <td colspan="6" class="px-4 py-12 text-center text-gray-400 text-sm">No defaulters found 🎉
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ── COLLECT PAYMENT MODAL ── -->
        <Teleport to="body">
            <div v-if="showPaymentModal && payingInvoice"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Collect Payment</h3>
                        <button @click="showPaymentModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <!-- Invoice summary -->
                        <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Invoice</span>
                                <span class="font-mono font-medium text-indigo-700">{{ payingInvoice.invoice_number
                                }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Student</span>
                                <span class="font-medium">{{ payingInvoice.student?.name }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Description</span>
                                <span class="text-gray-700">{{ payingInvoice.description }}</span>
                            </div>
                            <div class="flex justify-between text-sm border-t border-gray-200 pt-2">
                                <span class="text-gray-500">Net Amount</span>
                                <span class="font-bold">৳{{ formatMoney(payingInvoice.net_amount) }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Already Paid</span>
                                <span class="text-green-600 font-medium">৳{{ formatMoney(payingInvoice.paid_amount)
                                }}</span>
                            </div>
                            <div class="flex justify-between text-sm font-bold">
                                <span class="text-red-600">Due Amount</span>
                                <span class="text-red-600">৳{{ formatMoney(payingInvoice.due_amount) }}</span>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Payment Amount *</label>
                            <input v-model="payForm.amount" type="number" step="0.01" :max="payingInvoice.due_amount"
                                :placeholder="`Max: ${payingInvoice.due_amount}`"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Payment Method *</label>
                            <select v-model="payForm.payment_method"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="bkash">bKash</option>
                                <option value="nagad">Nagad</option>
                                <option value="cheque">Cheque</option>
                                <option value="online">Online</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Payment Date *</label>
                            <input v-model="payForm.payment_date" type="text" placeholder="YYYY-MM-DD"
                                autocomplete="new-password"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                            <input v-model="payForm.remarks" autocomplete="new-password"
                                placeholder="Optional remarks..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showPaymentModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handlePayment" :disabled="paying"
                            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                            {{ paying ? 'Processing...' : 'Collect Payment' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── CREATE INVOICE MODAL ── -->
        <Teleport to="body">
            <div v-if="showInvoiceModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Create Invoice</h3>
                        <button @click="showInvoiceModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <input type="text" style="display:none" autocomplete="username" />
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Student *</label>
                            <input v-model="invoiceForm.studentSearch" @input="searchStudentsForInvoice" type="search"
                                autocomplete="new-password" placeholder="Search student by name or ID..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            <div v-if="studentResults.length"
                                class="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <button v-for="s in studentResults" :key="s.id" @click="selectStudentForInvoice(s)"
                                    class="w-full flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 text-left border-b border-gray-50 last:border-0">
                                    <img :src="s.avatar_url" class="w-6 h-6 rounded-full" />
                                    <span class="text-sm text-gray-900">{{ s.name }}</span>
                                    <span class="text-xs font-mono text-gray-400">{{ s.student_id }}</span>
                                </button>
                            </div>
                            <div v-if="invoiceForm.student_profile_id"
                                class="mt-2 flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-indigo-600" />
                                <span class="text-sm text-indigo-700">{{ invoiceForm.selectedStudentName }}</span>
                                <button
                                    @click="invoiceForm.student_profile_id = ''; invoiceForm.selectedStudentName = ''"
                                    class="ml-auto text-gray-400 hover:text-gray-600">
                                    <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Fee Type *</label>
                                <select v-model="invoiceForm.fee_type"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="tuition">Tuition</option>
                                    <option value="lab">Lab</option>
                                    <option value="library">Library</option>
                                    <option value="exam">Exam</option>
                                    <option value="admission">Admission</option>
                                    <option value="transport">Transport</option>
                                    <option value="misc">Misc</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Amount *</label>
                                <input v-model="invoiceForm.amount" type="number" min="0" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Description *</label>
                                <input v-model="invoiceForm.description" autocomplete="new-password"
                                    placeholder="e.g. Tuition Fee - Fall 2024"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Semester *</label>
                                <input v-model="invoiceForm.semester" autocomplete="new-password"
                                    placeholder="Fall 2024"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Academic Year *</label>
                                <input v-model="invoiceForm.academic_year" autocomplete="new-password"
                                    placeholder="2024-2025"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Due Date *</label>
                                <input v-model="invoiceForm.due_date" type="text" autocomplete="new-password"
                                    placeholder="YYYY-MM-DD"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Discount</label>
                                <input v-model="invoiceForm.discount" type="number" min="0" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showInvoiceModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleCreateInvoice" :disabled="creatingInvoice"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ creatingInvoice ? 'Creating...' : 'Create Invoice' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── FEE STRUCTURE MODAL ── -->
        <Teleport to="body">
            <div v-if="showStructureModal"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingStructure ? 'Edit Fee Structure' :
                            'Add Fee Structure' }}</h3>
                        <button @click="showStructureModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <input type="text" style="display:none" autocomplete="username" />
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                            <input v-model="structureForm.name" autocomplete="new-password"
                                placeholder="e.g. Tuition Fee"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Fee Type *</label>
                                <select v-model="structureForm.fee_type"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="tuition">Tuition</option>
                                    <option value="lab">Lab</option>
                                    <option value="library">Library</option>
                                    <option value="exam">Exam</option>
                                    <option value="admission">Admission</option>
                                    <option value="transport">Transport</option>
                                    <option value="misc">Misc</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Amount (৳) *</label>
                                <input v-model="structureForm.amount" type="number" min="0" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Program</label>
                                <select v-model="structureForm.program_id"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">All Programs</option>
                                    <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.code }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Mandatory</label>
                                <select v-model="structureForm.is_mandatory"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option :value="true">Yes</option>
                                    <option :value="false">No</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
                            <input v-model="structureForm.description" autocomplete="new-password"
                                placeholder="Optional description"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showStructureModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSaveStructure" :disabled="savingStructure"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ savingStructure ? 'Saving...' : (editingStructure ? 'Save Changes' : 'Create') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const ui = useUiStore()
const api = useApi()
const toast = useToast()

ui.setPageTitle('Fee Management')

const tabs = [
    { key: 'invoices', label: 'Invoices' },
    { key: 'structures', label: 'Fee Structures' },
    { key: 'defaulters', label: 'Defaulters' },
]

const activeTab = ref('invoices')
const invoices = ref([])
const defaulters = ref([])
const structures = ref([])
const programs = ref([])
const stats = ref({})
const loadingInvoices = ref(false)
const loadingDefaulters = ref(false)
const paying = ref(false)
const creatingInvoice = ref(false)
const savingStructure = ref(false)

const showPaymentModal = ref(false)
const showInvoiceModal = ref(false)
const showStructureModal = ref(false)
const payingInvoice = ref(null)
const editingStructure = ref(null)
const studentResults = ref([])

const invoicePagination = ref({ total: 0, current_page: 1, last_page: 1 })
const invoiceFilters = reactive({ search: '', status: '', fee_type: '', page: 1 })

const payForm = reactive({ amount: '', payment_method: 'cash', payment_date: new Date().toISOString().slice(0, 10), remarks: '' })
const invoiceForm = reactive({ studentSearch: '', student_profile_id: '', selectedStudentName: '', fee_type: 'tuition', description: '', amount: '', discount: 0, semester: 'Fall 2024', academic_year: '2024-2025', due_date: '' })
const structureForm = reactive({ name: '', fee_type: 'tuition', amount: '', program_id: '', is_mandatory: true, description: '' })

const invoicePageNumbers = computed(() => { const p = []; for (let i = Math.max(1, invoicePagination.value.current_page - 2); i <= Math.min(invoicePagination.value.last_page, invoicePagination.value.current_page + 2); i++) p.push(i); return p })

const formatMoney = (v) => Number(v || 0).toLocaleString('en-BD', { minimumFractionDigits: 0 })
const isOverdue = (inv) => inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < new Date()

const feeTypeColor = (t) => ({
    tuition: 'text-purple-700 bg-purple-50',
    lab: 'text-green-700 bg-green-50',
    library: 'text-blue-700 bg-blue-50',
    exam: 'text-amber-700 bg-amber-50',
    admission: 'text-indigo-700 bg-indigo-50',
    transport: 'text-teal-700 bg-teal-50',
    misc: 'text-gray-700 bg-gray-100',
}[t] || 'text-gray-700 bg-gray-100')

const statusColor = (s) => ({
    paid: 'text-green-700 bg-green-50',
    partial: 'text-yellow-700 bg-yellow-50',
    unpaid: 'text-gray-600 bg-gray-100',
    overdue: 'text-red-700 bg-red-50',
    waived: 'text-blue-700 bg-blue-50',
}[s] || 'text-gray-600 bg-gray-100')

let searchTimer = null
const debouncedFetchInvoices = () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchInvoices, 400) }

const fetchInvoices = async () => {
    loadingInvoices.value = true
    try {
        const res = await api.get('/fees/invoices', { search: invoiceFilters.search || undefined, status: invoiceFilters.status || undefined, fee_type: invoiceFilters.fee_type || undefined, page: invoiceFilters.page })
        invoices.value = res.data || []
        invoicePagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loadingInvoices.value = false }
}

const fetchDefaulters = async () => {
    loadingDefaulters.value = true
    try { const res = await api.get('/fees/defaulters'); defaulters.value = res.data || [] }
    finally { loadingDefaulters.value = false }
}

const fetchStructures = async () => { try { const r = await api.get('/fees/structures', { all: true }); structures.value = r.data || [] } catch { } }
const fetchStats = async () => { try { const r = await api.get('/fees/stats'); stats.value = r.data || {} } catch { } }
const fetchPrograms = async () => { try { const r = await api.get('/programs', { all: true }); programs.value = r.data || [] } catch { } }

const changeInvoicePage = (p) => { invoiceFilters.page = p; fetchInvoices() }

// Payment
const openPayment = (inv) => {
    payingInvoice.value = inv
    payForm.amount = inv.due_amount
    payForm.payment_date = new Date().toISOString().slice(0, 10)
    payForm.payment_method = 'cash'
    payForm.remarks = ''
    showPaymentModal.value = true
}

const handlePayment = async () => {
    if (!payForm.amount || payForm.amount <= 0) { toast.add({ title: 'Enter valid amount', color: 'red' }); return }
    paying.value = true
    try {
        await api.post(`/fees/invoices/${payingInvoice.value.id}/pay`, payForm)
        toast.add({ title: 'Payment collected successfully', color: 'green' })
        showPaymentModal.value = false
        fetchInvoices(); fetchStats(); fetchDefaulters()
    } finally { paying.value = false }
}

// Create invoice
const openCreateInvoice = () => {
    Object.assign(invoiceForm, { studentSearch: '', student_profile_id: '', selectedStudentName: '', fee_type: 'tuition', description: '', amount: '', discount: 0, semester: 'Fall 2024', academic_year: '2024-2025', due_date: '' })
    studentResults.value = []
    showInvoiceModal.value = true
}

let stuTimer = null
const searchStudentsForInvoice = () => {
    clearTimeout(stuTimer)
    stuTimer = setTimeout(async () => {
        if (!invoiceForm.studentSearch || invoiceForm.studentSearch.length < 2) { studentResults.value = []; return }
        try { const res = await api.get('/students', { search: invoiceForm.studentSearch, per_page: 5 }); studentResults.value = res.data || [] } catch { }
    }, 300)
}

const selectStudentForInvoice = (s) => {
    invoiceForm.student_profile_id = s.id
    invoiceForm.selectedStudentName = `${s.name} (${s.student_id})`
    invoiceForm.studentSearch = ''
    studentResults.value = []
}

const handleCreateInvoice = async () => {
    if (!invoiceForm.student_profile_id || !invoiceForm.amount || !invoiceForm.due_date) { toast.add({ title: 'Fill all required fields', color: 'red' }); return }
    creatingInvoice.value = true
    try {
        await api.post('/fees/invoices', { student_profile_id: invoiceForm.student_profile_id, fee_type: invoiceForm.fee_type, description: invoiceForm.description, amount: invoiceForm.amount, discount: invoiceForm.discount || 0, semester: invoiceForm.semester, academic_year: invoiceForm.academic_year, due_date: invoiceForm.due_date })
        toast.add({ title: 'Invoice created', color: 'green' })
        showInvoiceModal.value = false; fetchInvoices(); fetchStats()
    } finally { creatingInvoice.value = false }
}

// Fee structures
const openCreateStructure = () => {
    editingStructure.value = null
    Object.assign(structureForm, { name: '', fee_type: 'tuition', amount: '', program_id: '', is_mandatory: true, description: '' })
    showStructureModal.value = true
}

const openEditStructure = (fs) => {
    editingStructure.value = fs
    Object.assign(structureForm, { name: fs.name, fee_type: fs.fee_type, amount: fs.amount, program_id: fs.program_id || '', is_mandatory: fs.is_mandatory, description: fs.description || '' })
    showStructureModal.value = true
}

const handleSaveStructure = async () => {
    if (!structureForm.name || !structureForm.amount) { toast.add({ title: 'Fill required fields', color: 'red' }); return }
    savingStructure.value = true
    try {
        editingStructure.value ? await api.put(`/fees/structures/${editingStructure.value.id}`, structureForm) : await api.post('/fees/structures', structureForm)
        toast.add({ title: editingStructure.value ? 'Structure updated' : 'Structure created', color: 'green' })
        showStructureModal.value = false; fetchStructures()
    } finally { savingStructure.value = false }
}

const deleteStructure = async (fs) => {
    if (!confirm(`Delete "${fs.name}"?`)) return
    try { await api.delete(`/fees/structures/${fs.id}`); toast.add({ title: 'Deleted', color: 'green' }); fetchStructures() } catch { }
}

watch(activeTab, (tab) => { if (tab === 'defaulters') fetchDefaulters() })

onMounted(async () => {
    await Promise.all([fetchInvoices(), fetchStats(), fetchStructures(), fetchPrograms()])
})
</script>