<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900">My Attendance</h2>
        <p class="text-sm text-gray-500 mt-1">Late counts as attended; leave is not counted against you</p>
      </div>
      <label class="text-sm">
        <span class="block text-gray-600 mb-1">Month</span>
        <input v-model="month" type="month" class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </label>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500">This month</p>
        <p v-if="data" :class="['mt-2 text-2xl font-bold', attendanceTone(data.summary.percent).text]">{{ pct(data.summary.percent) }}</p>
        <USkeleton v-else class="h-8 w-16 mt-2" />
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500">This year</p>
        <p v-if="data" :class="['mt-2 text-2xl font-bold', attendanceTone(data.year.percent).text]">{{ pct(data.year.percent) }}</p>
        <USkeleton v-else class="h-8 w-16 mt-2" />
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500">Absent this month</p>
        <p v-if="data" class="mt-2 text-2xl font-bold text-gray-900">{{ data.summary.absent }}</p>
        <USkeleton v-else class="h-8 w-16 mt-2" />
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500">Late / leave</p>
        <p v-if="data" class="mt-2 text-2xl font-bold text-gray-900">{{ data.summary.late }} / {{ data.summary.leave }}</p>
        <USkeleton v-else class="h-8 w-16 mt-2" />
      </div>
    </div>

    <!-- Calendar -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-gray-400 mb-1.5">
        <span v-for="d in ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']" :key="d">{{ d }}</span>
      </div>
      <div v-if="data" class="grid grid-cols-7 gap-1.5">
        <span v-for="n in leadingBlanks" :key="`b${n}`" />
        <div v-for="day in calendar" :key="day.date" :title="day.title"
          :class="['aspect-square sm:aspect-auto sm:h-16 rounded-lg p-1.5 text-left flex flex-col justify-between', day.tone]">
          <span class="text-xs font-semibold">{{ day.n }}</span>
          <span v-if="day.status" class="hidden sm:block text-[11px] font-medium capitalize">{{ day.status }}</span>
        </div>
      </div>
      <USkeleton v-else class="h-64 w-full" />
      <div class="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <span v-for="(tone, status) in TONES" :key="status" class="inline-flex items-center gap-1.5">
          <span :class="['w-3 h-3 rounded', tone]" /> <span class="capitalize">{{ status }}</span>
        </span>
        <span class="inline-flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-gray-50 ring-1 ring-gray-200" /> No class / not taken</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['student'] })
useUiStore().setPageTitle('My Attendance')

const api = useApi()
const { attendanceTone } = useAcademicFormat()

const pad = n => String(n).padStart(2, '0')
const now = new Date()
const month = ref(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`)
const data = ref(null)

const TONES = {
  present: 'bg-emerald-100 text-emerald-800',
  late: 'bg-amber-100 text-amber-800',
  absent: 'bg-rose-100 text-rose-800',
  leave: 'bg-sky-100 text-sky-800',
}
const pct = p => p === null || p === undefined ? '—' : `${p}%`

// Bangladeshi week starts on Saturday
const leadingBlanks = computed(() => (new Date(`${month.value}-01T00:00:00`).getDay() + 1) % 7)
const calendar = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  const days = new Date(y, m, 0).getDate()
  const byDate = Object.fromEntries((data.value?.days || []).map(d => [d.date, d]))
  return Array.from({ length: days }, (_, i) => {
    const date = `${month.value}-${pad(i + 1)}`
    const rec = byDate[date]
    return {
      date, n: i + 1, status: rec?.status,
      tone: rec ? TONES[rec.status] : 'bg-gray-50 text-gray-400',
      title: rec ? `${rec.status}${rec.remarks ? ` — ${rec.remarks}` : ''}` : 'No attendance',
    }
  })
})

const load = async () => {
  data.value = null
  try { data.value = (await api.get('/me/student/daily-attendance', { month: month.value })).data } catch {
    data.value = { days: [], summary: { percent: null, absent: 0, late: 0, leave: 0 }, year: { percent: null } }
  }
}
watch(month, m => m && load())
onMounted(load)
</script>
