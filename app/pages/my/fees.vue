<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900">My Fees</h2>
      <p class="text-sm text-gray-500 mt-1">Invoices and payments on your account</p>
    </div>

    <div class="grid sm:grid-cols-3 gap-4">
      <div v-for="card in cards" :key="card.label" class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500">{{ card.label }}</p>
        <p v-if="data" :class="['text-2xl font-bold mt-2', card.class]">{{ money(card.value) }}</p>
        <USkeleton v-else class="h-8 w-28 mt-2" />
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <TableSkeleton v-if="!data" :rows="3" />
      <p v-else-if="!data.invoices.length" class="p-12 text-center text-gray-500">No invoices yet.</p>
      <ul v-else class="divide-y divide-gray-100">
        <li v-for="inv in data.invoices" :key="inv.id" class="px-5 py-4">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex-1 min-w-48">
              <p class="font-medium text-gray-900">{{ inv.description }}</p>
              <p class="text-xs text-gray-400">{{ inv.invoice_number }} · {{ inv.semester }} · due {{ inv.due_date }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ money(inv.paid_amount) }} of {{ money(inv.net_amount) }} paid</p>
              <p v-if="inv.due_amount > 0" class="text-sm font-semibold text-rose-600">{{ money(inv.due_amount) }} due</p>
            </div>
            <span :class="['text-xs font-medium px-2.5 py-1 rounded-full capitalize', invoiceTone(inv.status)]">{{ inv.status }}</span>
            <button v-if="inv.payments.length" type="button" class="text-xs text-emerald-700 hover:underline" @click="toggle(inv.id)">
              {{ open[inv.id] ? 'Hide' : 'Show' }} payments ({{ inv.payments.length }})
            </button>
          </div>
          <ul v-if="open[inv.id]" class="mt-3 ml-1 space-y-1.5 border-l-2 border-emerald-100 pl-4">
            <li v-for="p in inv.payments" :key="p.transaction_id" class="text-xs text-gray-600 flex flex-wrap gap-x-4">
              <span class="font-medium text-gray-900">{{ money(p.amount) }}</span>
              <span class="capitalize">{{ p.method?.replace('_', ' ') }}</span>
              <span>{{ p.date }}</span>
              <span class="text-gray-400">{{ p.transaction_id }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <p class="text-xs text-gray-400">To pay a fee, visit the accounts office. Online payment is not available yet.</p>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['student'] })

useUiStore().setPageTitle('My Fees')
const api = useApi()
const { money, invoiceTone } = useAcademicFormat()

const data = ref(null)
const open = reactive({})
const toggle = id => { open[id] = !open[id] }

const cards = computed(() => [
  { label: 'Total billed', value: data.value?.summary.total_billed, class: 'text-gray-900' },
  { label: 'Paid', value: data.value?.summary.total_paid, class: 'text-emerald-700' },
  { label: 'Due', value: data.value?.summary.total_due, class: data.value?.summary.total_due > 0 ? 'text-rose-600' : 'text-gray-900' },
])

onMounted(async () => {
  try {
    data.value = (await api.get('/me/student/fees')).data
  } catch {
    data.value = { summary: { total_billed: 0, total_paid: 0, total_due: 0 }, invoices: [] }
  }
})
</script>
