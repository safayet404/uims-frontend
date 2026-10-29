<template>
  <div class="space-y-6">
    <template v-if="!selected">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Monthly Fees</h2>
          <p class="text-sm text-gray-500 mt-1">Bill every {{ terms.group.toLowerCase() }} once a month and track who has paid.</p>
        </div>
        <div class="flex flex-wrap items-end gap-2">
          <label class="text-sm">
            <span class="block text-gray-600 mb-1">Month</span>
            <input v-model="month" type="month" class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          </label>
          <template v-if="can('fees.create')">
            <label class="text-sm">
              <span class="block text-gray-600 mb-1">Due date</span>
              <input v-model="dueDate" type="date" class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            </label>
            <button type="button" :disabled="generating || !dueDate" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50" @click="generateAll">
              {{ generating ? 'Creating…' : `Bill all for ${monthLabel}` }}
            </button>
          </template>
        </div>
      </div>

      <div v-if="data" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5"><p class="text-sm text-gray-500">Billed in {{ monthLabel }}</p><p class="text-2xl font-bold text-gray-900 mt-1">{{ money(data.totals.billed) }}</p></div>
        <div class="bg-white rounded-xl border border-gray-200 p-5"><p class="text-sm text-gray-500">Collected</p><p class="text-2xl font-bold text-emerald-700 mt-1">{{ money(data.totals.collected) }}</p></div>
        <div class="bg-white rounded-xl border border-gray-200 p-5"><p class="text-sm text-gray-500">Still due</p><p class="text-2xl font-bold text-red-600 mt-1">{{ money(data.totals.due) }}</p></div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <TableSkeleton v-if="!data" :rows="5" :cols="6" />
        <p v-else-if="!data.groups.length" class="p-12 text-center text-gray-500">No active {{ terms.groups.toLowerCase() }} yet.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/60">
                <th class="px-5 py-3 font-medium">{{ terms.group }}</th>
                <th class="px-3 py-3 font-medium text-right">Fee / month</th>
                <th class="px-3 py-3 font-medium text-center">Billed</th>
                <th class="px-3 py-3 font-medium text-right">Amount</th>
                <th class="px-3 py-3 font-medium text-right">Collected</th>
                <th class="px-3 py-3 font-medium text-right">Due</th>
                <th class="px-5 py-3 font-medium w-40">Collection</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="g in data.groups" :key="g.id" class="hover:bg-gray-50/60 cursor-pointer" @click="open(g.id)">
                <td class="px-5 py-3">
                  <button type="button" class="font-medium text-gray-900 hover:text-emerald-700 text-left" @click.stop="open(g.id)">{{ g.display_name }}</button>
                </td>
                <td class="px-3 py-3 text-right">{{ g.monthly_fee !== null ? money(g.monthly_fee) : '' }}<span v-if="g.monthly_fee === null" class="text-xs text-amber-600">Not set</span></td>
                <td class="px-3 py-3 text-center text-gray-600">{{ g.invoiced }}/{{ g.students_count }}</td>
                <td class="px-3 py-3 text-right">{{ money(g.billed) }}</td>
                <td class="px-3 py-3 text-right text-emerald-700">{{ money(g.collected) }}</td>
                <td class="px-3 py-3 text-right font-medium" :class="g.due ? 'text-red-600' : 'text-gray-400'">{{ money(g.due) }}</td>
                <td class="px-5 py-3">
                  <div v-if="g.billed" class="flex items-center gap-2">
                    <div class="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${Math.min(100, (g.collected / g.billed) * 100)}%` }" />
                    </div>
                    <span class="text-xs text-gray-500 w-9 text-right">{{ Math.round((g.collected / g.billed) * 100) }}%</span>
                  </div>
                  <span v-else class="text-xs text-gray-400">Not billed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p v-if="data?.groups.some(g => g.monthly_fee === null)" class="text-xs text-gray-500">
        {{ terms.groups }} without a monthly fee are skipped. Set the fee when editing the {{ terms.group.toLowerCase() }}.
      </p>
    </template>

    <template v-else>
      <button type="button" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900" @click="close">
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" /> Monthly Fees
      </button>
      <h2 class="text-xl font-bold text-gray-900">{{ selectedName }}</h2>
      <GroupFees :group-id="selected" />
    </template>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', permission: 'fees.read' })
useUiStore().setPageTitle('Monthly Fees')

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()
const { can } = usePermission()
const { terms } = useInstitution()
const { money } = useAcademicFormat()

const pad = n => String(n).padStart(2, '0')
const now = new Date()
const month = ref(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`)
const dueDate = ref(`${month.value}-10`)
const data = ref(null)
const generating = ref(false)
const monthLabel = computed(() => new Date(`${month.value}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))

const selected = computed(() => Number(route.query.group) || null)
const selectedName = ref('')

const load = async () => {
  data.value = null
  try { data.value = (await api.get('/fees/monthly', { month: month.value })).data } catch { data.value = { groups: [], totals: {} } }
}
watch(month, (m) => { if (m) { dueDate.value = `${m}-10`; load() } })

const open = (id) => {
  selectedName.value = data.value?.groups.find(g => g.id === id)?.display_name || ''
  router.push({ query: { group: id } })
}
const close = () => { router.push({ query: {} }); load() }

const generateAll = async () => {
  if (!confirm(`Create ${monthLabel.value} invoices for every ${terms.value.group.toLowerCase()} with a monthly fee?`)) return
  generating.value = true
  try {
    const res = await api.post('/fees/monthly/generate', { month: month.value, due_date: dueDate.value })
    toast.add({ title: res.message, color: 'success' })
    await load()
  } catch { /* useApi already shows the error */ } finally {
    generating.value = false
  }
}

onMounted(async () => {
  await load()
  if (selected.value) selectedName.value = data.value?.groups.find(g => g.id === selected.value)?.display_name || ''
})
</script>
