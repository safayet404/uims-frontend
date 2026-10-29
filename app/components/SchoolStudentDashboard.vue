<template>
  <div class="space-y-6">
    <!-- Welcome -->
    <div class="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-700 to-teal-600 p-6 text-white">
      <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
      <div class="relative">
        <h2 class="text-2xl font-bold">Welcome back, {{ firstName }} 👋</h2>
        <p v-if="data" class="text-emerald-50/90 mt-1 text-sm">
          <template v-if="data.groups.length">
            <span v-for="(g, i) in data.groups" :key="g.id">{{ i ? ' · ' : '' }}{{ g.display_name }}<template v-if="g.roll_number">, roll {{ g.roll_number }}</template></span>
          </template>
          <template v-else>You are not in a {{ terms.group.toLowerCase() }} yet.</template>
        </p>
        <USkeleton v-else class="h-4 w-64 mt-2 bg-white/20" />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Today -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500">Today</p>
        <template v-if="data">
          <p :class="['mt-3 text-2xl font-bold', todayInfo.class]">{{ todayInfo.label }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ todayInfo.hint }}</p>
        </template>
        <USkeleton v-else class="h-7 w-24 mt-3" />
      </div>
      <!-- Attendance this month -->
      <NuxtLink to="/my/attendance" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 transition-colors">
        <p class="text-sm text-gray-500">Attendance this month</p>
        <template v-if="data">
          <p :class="['mt-3 text-2xl font-bold', attendanceTone(month.percent).text]">{{ month.percent ?? '—' }}<span v-if="month.percent !== null">%</span></p>
          <p class="text-xs text-gray-400 mt-1">{{ month.present + month.late }} of {{ month.present + month.late + month.absent }} days<span v-if="month.leave"> · {{ month.leave }} on leave</span></p>
          <div v-if="month.percent !== null" class="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div :class="['h-full rounded-full', attendanceTone(month.percent).bar]" :style="{ width: `${month.percent}%` }" />
          </div>
        </template>
        <USkeleton v-else class="h-7 w-20 mt-3" />
      </NuxtLink>
      <!-- Latest result -->
      <NuxtLink to="/my/exam-results" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 transition-colors">
        <p class="text-sm text-gray-500">Latest result</p>
        <template v-if="data">
          <template v-if="latest">
            <p class="mt-3 text-2xl font-bold text-gray-900">
              <template v-if="latest.mode === 'gpa5'">GPA {{ latest.result.gpa?.toFixed(2) ?? '—' }}</template>
              <template v-else-if="latest.mode === 'marks'">{{ latest.result.percent }}%</template>
              <template v-else>{{ latest.result.total }}/{{ latest.result.full_total }}</template>
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ latest.exam.name }}<template v-if="latest.result.section_position"> · position {{ latest.result.section_position }} of {{ latest.group_size }}</template>
            </p>
          </template>
          <p v-else class="mt-3 text-sm text-gray-400">No results published yet.</p>
        </template>
        <USkeleton v-else class="h-7 w-24 mt-3" />
      </NuxtLink>
      <!-- Fees -->
      <NuxtLink to="/my/fees" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 transition-colors">
        <p class="text-sm text-gray-500">Fees due</p>
        <template v-if="data">
          <p :class="['mt-3 text-2xl font-bold', data.fees.due > 0 ? 'text-rose-600' : 'text-emerald-700']">{{ money(data.fees.due) }}</p>
          <p class="text-xs text-gray-400 mt-1">
            <template v-if="data.fees.due > 0">{{ data.fees.invoices }} {{ data.fees.invoices === 1 ? 'invoice' : 'invoices' }}<template v-if="data.fees.next_due_date"> · due {{ fmt(data.fees.next_due_date) }}</template></template>
            <template v-else>All paid</template>
          </p>
        </template>
        <USkeleton v-else class="h-7 w-24 mt-3" />
      </NuxtLink>
    </div>

    <!-- Class info -->
    <div v-if="data?.groups.length" class="grid md:grid-cols-2 gap-4">
      <NuxtLink v-for="g in data.groups" :key="g.id" to="/my/class" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 transition-colors">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">{{ g.display_name }}</h3>
          <span class="text-xs text-gray-400">{{ g.academic_year }}</span>
        </div>
        <dl class="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <dt class="text-gray-500">Roll</dt><dd class="text-gray-900">{{ g.roll_number ?? '—' }}</dd>
          <dt class="text-gray-500">{{ g.kind === 'batch' ? 'Teacher' : 'Class teacher' }}</dt><dd class="text-gray-900">{{ g.class_teacher || '—' }}</dd>
          <template v-if="g.fourth_subject"><dt class="text-gray-500">4th subject</dt><dd class="text-gray-900">{{ g.fourth_subject }}</dd></template>
          <template v-if="g.schedule_note"><dt class="text-gray-500">Class time</dt><dd class="text-gray-900">{{ g.schedule_note }}</dd></template>
        </dl>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const api = useApi()
const { terms } = useInstitution()
const { money, attendanceTone } = useAcademicFormat()

const data = ref(null)
const firstName = computed(() => auth.user?.name?.split(' ')[0] || 'there')
const month = computed(() => data.value?.attendance.month || { percent: null, present: 0, late: 0, absent: 0, leave: 0 })
const latest = computed(() => data.value?.latest_result)
const fmt = d => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

const TODAY = {
  present: { label: 'Present', class: 'text-emerald-700', hint: 'Marked by your class teacher' },
  late: { label: 'Late', class: 'text-amber-600', hint: 'Counted as attended' },
  absent: { label: 'Absent', class: 'text-rose-600', hint: 'Marked by your class teacher' },
  leave: { label: 'On leave', class: 'text-sky-700', hint: 'Excused' },
}
const todayInfo = computed(() => TODAY[data.value?.attendance.today] || { label: 'Not taken', class: 'text-gray-400', hint: 'Attendance has not been taken yet' })

onMounted(async () => {
  try {
    data.value = (await api.get('/me/student/overview-school')).data
  } catch {
    data.value = { groups: [], attendance: { today: null, month: { percent: null, present: 0, late: 0, absent: 0, leave: 0 } }, latest_result: null, fees: { due: 0, invoices: 0 } }
  }
})
</script>
