<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="flex flex-wrap items-end justify-between gap-4 p-5 border-b border-gray-100">
      <div class="flex flex-wrap items-end gap-4">
        <label class="text-sm">
          <span class="block text-gray-600 mb-1">Month</span>
          <input v-model="month" type="month" class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
        </label>
        <p v-if="sheet" class="text-sm text-gray-500 pb-2">
          Monthly fee: <b class="text-gray-900">{{ sheet.monthly_fee !== null ? money(sheet.monthly_fee) : 'not set' }}</b>
        </p>
      </div>
      <div v-if="can('fees.create') && sheet && unbilled" class="flex flex-wrap items-end gap-2">
        <label class="text-sm">
          <span class="block text-gray-600 mb-1">Due date</span>
          <input v-model="dueDate" type="date" class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
        </label>
        <button type="button" :disabled="generating || !sheet.monthly_fee || !dueDate" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50" @click="generate">
          {{ generating ? 'Creating…' : `Bill ${unbilled} for ${sheet.month_label}` }}
        </button>
      </div>
    </div>

    <div v-if="sheet" class="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 border-b border-gray-100">
      <div class="bg-white px-5 py-3">
        <p class="text-xs text-gray-500">Billed</p>
        <p class="text-lg font-semibold text-gray-900">{{ sheet.totals.invoiced }}<span class="text-sm font-normal text-gray-400"> / {{ sheet.totals.students }} students</span></p>
      </div>
      <div class="bg-white px-5 py-3"><p class="text-xs text-gray-500">Amount</p><p class="text-lg font-semibold text-gray-900">{{ money(sheet.totals.billed) }}</p></div>
      <div class="bg-white px-5 py-3"><p class="text-xs text-gray-500">Collected</p><p class="text-lg font-semibold text-emerald-700">{{ money(sheet.totals.collected) }}</p></div>
      <div class="bg-white px-5 py-3"><p class="text-xs text-gray-500">Due</p><p class="text-lg font-semibold text-red-600">{{ money(sheet.totals.due) }}</p></div>
    </div>

    <TableSkeleton v-if="!sheet" :rows="5" :cols="6" />
    <p v-else-if="!sheet.students.length" class="p-12 text-center text-gray-500">No students yet.</p>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/60">
            <th class="px-5 py-3 font-medium w-16">Roll</th>
            <th class="px-5 py-3 font-medium">Student</th>
            <th class="px-3 py-3 font-medium">Discount / month</th>
            <th class="px-3 py-3 font-medium text-right">{{ sheet.month_label }}</th>
            <th class="px-3 py-3 font-medium text-right">Paid</th>
            <th class="px-3 py-3 font-medium text-right">Due</th>
            <th class="px-3 py-3 font-medium">Earlier dues</th>
            <th class="px-5 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in sheet.students" :key="r.member_id">
            <td class="px-5 py-2 text-gray-500">{{ r.roll_number }}</td>
            <td class="px-5 py-2">
              <p class="font-medium text-gray-900 whitespace-nowrap">{{ r.name }}</p>
              <p class="text-xs text-gray-400">{{ r.student_id }}</p>
            </td>
            <td class="px-3 py-2">
              <div v-if="editing === r.member_id" class="flex flex-wrap items-center gap-1">
                <input v-model.number="discountForm.monthly_discount" type="number" min="0" :max="sheet.monthly_fee ?? undefined" step="50" aria-label="Discount amount"
                  class="w-20 rounded border border-gray-200 px-2 py-1 text-sm">
                <input v-model="discountForm.discount_note" maxlength="255" placeholder="Reason" aria-label="Discount reason" class="w-28 rounded border border-gray-200 px-2 py-1 text-sm">
                <button type="button" class="text-xs font-medium text-emerald-700 hover:underline" @click="saveDiscount(r)">Save</button>
                <button type="button" class="text-xs text-gray-500 hover:underline" @click="editing = null">Cancel</button>
              </div>
              <div v-else class="flex items-center gap-2">
                <span v-if="r.monthly_discount" class="text-gray-800">{{ money(r.monthly_discount) }}<span v-if="r.discount_note" class="text-xs text-gray-400"> · {{ r.discount_note }}</span></span>
                <span v-else class="text-gray-300">—</span>
                <button v-if="can('fees.edit')" type="button" class="text-xs text-emerald-700 hover:underline" :aria-label="`Edit discount of ${r.name}`" @click="editDiscount(r)">Edit</button>
              </div>
            </td>
            <td class="px-3 py-2 text-right whitespace-nowrap">
              <template v-if="r.invoice">
                <span class="text-gray-900">{{ money(r.invoice.net_amount) }}</span>
                <span :class="['ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium', badge(r.invoice).tone]">{{ badge(r.invoice).label }}</span>
              </template>
              <span v-else class="text-xs text-gray-400">Not billed</span>
            </td>
            <td class="px-3 py-2 text-right text-gray-700">{{ r.invoice ? money(r.invoice.paid_amount) : '—' }}</td>
            <td class="px-3 py-2 text-right font-medium" :class="r.invoice?.due_amount ? 'text-red-600' : 'text-gray-400'">{{ r.invoice ? money(r.invoice.due_amount) : '—' }}</td>
            <td class="px-3 py-2">
              <span v-if="r.earlier_due" class="text-red-600 font-medium" :title="r.earlier_months.map(monthLabel).join(', ')">
                {{ money(r.earlier_due) }} <span class="text-xs font-normal text-gray-500">({{ r.earlier_months.map(shortMonth).join(', ') }})</span>
              </span>
              <span v-else class="text-gray-300">—</span>
            </td>
            <td class="px-5 py-2 text-right whitespace-nowrap">
              <button v-if="can('fees.collect') && r.invoice?.due_amount" type="button" class="px-3 py-1 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500" @click="openCollect(r)">
                Collect
              </button>
              <template v-if="r.invoice?.last_payment_id">
                <button type="button" class="p-1.5 text-gray-500 hover:text-emerald-700" :aria-label="`Download receipt of ${r.name}`" title="Download receipt" @click="downloadReceipt(r.invoice.last_payment_id)">
                  <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                </button>
                <button type="button" class="p-1.5 text-gray-500 hover:text-emerald-700" :aria-label="`Print receipt of ${r.name}`" title="Print receipt" @click="pdf.print(receiptPath(r.invoice.last_payment_id, true))">
                  <UIcon name="i-heroicons-printer" class="w-4 h-4" />
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Collect payment -->
    <Teleport to="body">
      <div v-if="collecting" class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50" @click.self="closeCollect">
        <form class="bg-white rounded-2xl shadow-2xl w-full max-w-md" role="dialog" aria-modal="true" @submit.prevent="collect">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ paidPaymentId ? 'Payment received' : 'Collect payment' }}</h3>
            <button type="button" class="text-gray-400 hover:text-gray-600" aria-label="Close" @click="closeCollect">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
          <div v-if="paidPaymentId" class="p-6 text-center space-y-4">
            <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-emerald-500 mx-auto" />
            <p class="text-sm text-gray-700">{{ money(collectForm.amount) }} received from {{ collecting.name }}.</p>
            <div class="flex justify-center gap-2">
              <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500" @click="pdf.print(receiptPath(paidPaymentId, true))">
                <UIcon name="i-heroicons-printer" class="w-4 h-4" /> Print receipt
              </button>
              <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" @click="downloadReceipt(paidPaymentId)">
                <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" /> Download
              </button>
            </div>
          </div>
          <template v-else>
            <div class="p-6 space-y-4">
              <p class="text-sm text-gray-600">{{ collecting.name }} · {{ sheet.month_label }} · due <b class="text-gray-900">{{ money(collecting.invoice.due_amount) }}</b></p>
              <label class="block text-sm">
                <span class="block text-xs font-medium text-gray-600 mb-1">Amount (৳) *</span>
                <input v-model.number="collectForm.amount" type="number" required min="1" :max="collecting.invoice.due_amount" step="any" :class="field">
              </label>
              <div class="grid grid-cols-2 gap-4">
                <label class="block text-sm">
                  <span class="block text-xs font-medium text-gray-600 mb-1">Method *</span>
                  <select v-model="collectForm.payment_method" :class="field">
                    <option v-for="m in methods" :key="m.value" :value="m.value">{{ m.label }}</option>
                  </select>
                </label>
                <label class="block text-sm">
                  <span class="block text-xs font-medium text-gray-600 mb-1">Date *</span>
                  <input v-model="collectForm.payment_date" type="date" required :class="field">
                </label>
              </div>
              <label class="block text-sm">
                <span class="block text-xs font-medium text-gray-600 mb-1">Note</span>
                <input v-model="collectForm.remarks" maxlength="255" placeholder="e.g. bKash TrxID" :class="field">
              </label>
            </div>
            <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button type="button" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" @click="closeCollect">Cancel</button>
              <button type="submit" :disabled="savingPayment" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50">
                {{ savingPayment ? 'Saving…' : 'Collect' }}
              </button>
            </div>
          </template>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  groupId: { type: Number, required: true },
})
const emit = defineEmits(['changed'])

const api = useApi()
const toast = useToast()
const pdf = usePdf()
const { can } = usePermission()
const { money } = useAcademicFormat()
const field = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900'

const pad = n => String(n).padStart(2, '0')
const now = new Date()
const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
const month = ref(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`)
const dueDate = ref(`${month.value}-10`)
const sheet = ref(null)
const generating = ref(false)

const methods = [
  { value: 'cash', label: 'Cash' }, { value: 'bkash', label: 'bKash' }, { value: 'nagad', label: 'Nagad' },
  { value: 'bank_transfer', label: 'Bank transfer' }, { value: 'cheque', label: 'Cheque' },
]
const monthLabel = m => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
const shortMonth = m => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short' })
const unbilled = computed(() => sheet.value ? sheet.value.students.filter(r => !r.invoice).length : 0)

const badge = (i) => {
  if (i.status === 'paid') return { label: 'Paid', tone: 'bg-emerald-50 text-emerald-700' }
  if (i.status === 'waived') return { label: 'Free', tone: 'bg-sky-50 text-sky-700' }
  if (i.is_overdue) return { label: 'Overdue', tone: 'bg-red-50 text-red-700' }
  if (i.status === 'partial') return { label: 'Partly paid', tone: 'bg-amber-50 text-amber-700' }
  return { label: 'Unpaid', tone: 'bg-gray-100 text-gray-700' }
}

const load = async () => {
  sheet.value = null
  try {
    sheet.value = (await api.get(`/student-groups/${props.groupId}/fees`, { month: month.value })).data
  } catch { sheet.value = { students: [], totals: {}, monthly_fee: null, month_label: monthLabel(month.value) } }
}
watch(month, (m) => { if (m) { dueDate.value = `${m}-10`; load() } })
watch(() => props.groupId, load)

const generate = async () => {
  generating.value = true
  try {
    const res = await api.post(`/student-groups/${props.groupId}/fees/generate`, { month: month.value, due_date: dueDate.value })
    toast.add({ title: res.message, color: 'success' })
    await load()
    emit('changed')
  } catch { /* useApi already shows the error */ } finally {
    generating.value = false
  }
}

// Discounts
const editing = ref(null)
const discountForm = reactive({ monthly_discount: 0, discount_note: '' })
const editDiscount = (r) => {
  editing.value = r.member_id
  Object.assign(discountForm, { monthly_discount: r.monthly_discount, discount_note: r.discount_note || '' })
}
const saveDiscount = async (r) => {
  try {
    const res = await api.patch(`/student-groups/${props.groupId}/members/${r.member_id}/discount`, {
      monthly_discount: discountForm.monthly_discount || 0, discount_note: discountForm.discount_note || null,
    })
    toast.add({ title: res.message, color: 'success' })
    editing.value = null
    await load()
  } catch { /* useApi already shows the error */ }
}

// Payments and receipts
const collecting = ref(null)
const paidPaymentId = ref(null)
const savingPayment = ref(false)
const collectForm = reactive({ amount: 0, payment_method: 'cash', payment_date: todayIso, remarks: '' })

const openCollect = (r) => {
  collecting.value = r
  paidPaymentId.value = null
  Object.assign(collectForm, { amount: r.invoice.due_amount, payment_method: 'cash', payment_date: todayIso, remarks: '' })
}
const closeCollect = () => { collecting.value = null; paidPaymentId.value = null }

const collect = async () => {
  savingPayment.value = true
  try {
    await api.post(`/fees/invoices/${collecting.value.invoice.id}/pay`, { ...collectForm, remarks: collectForm.remarks || null })
    await load()
    paidPaymentId.value = sheet.value.students.find(r => r.member_id === collecting.value.member_id)?.invoice?.last_payment_id ?? null
    if (!paidPaymentId.value) closeCollect()
    toast.add({ title: 'Payment collected', color: 'success' })
    emit('changed')
  } catch { /* useApi already shows the error */ } finally {
    savingPayment.value = false
  }
}

const receiptPath = (paymentId, inline = false) => `/fees/payments/${paymentId}/receipt${inline ? '?inline=1' : ''}`
const downloadReceipt = id => pdf.download(receiptPath(id), `receipt-${id}.pdf`)

onMounted(load)
</script>
