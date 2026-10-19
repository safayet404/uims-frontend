<template>
  <div class="space-y-6">
    <!-- Welcome -->
    <div class="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-700 to-teal-600 p-6 text-white">
      <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
      <div class="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-emerald-100 text-sm">{{ term }}</p>
          <h2 class="text-2xl font-bold mt-1">Welcome back, {{ firstName }} 👋</h2>
          <p v-if="data" class="text-emerald-50/90 mt-1 text-sm">
            {{ data.profile.student_id }} · {{ data.profile.program || data.profile.department }} · {{ data.profile.semester }} semester
          </p>
          <USkeleton v-else class="h-4 w-64 mt-2 bg-white/20" />
        </div>
        <NuxtLink to="/my/results" class="rounded-xl bg-white/15 ring-1 ring-white/25 px-4 py-2 text-sm font-medium hover:bg-white/25 transition-colors">
          View results →
        </NuxtLink>
      </div>
    </div>

    <!-- Key numbers -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in cards" :key="card.label" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center gap-3">
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', card.bg]">
            <UIcon :name="card.icon" :class="['w-5 h-5', card.color]" />
          </div>
          <p class="text-sm text-gray-500">{{ card.label }}</p>
        </div>
        <template v-if="data">
          <p :class="['mt-3 text-2xl font-bold', card.valueClass || 'text-gray-900']">{{ card.value }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ card.hint }}</p>
          <div v-if="card.progress !== undefined" class="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div :class="['h-full rounded-full', card.bar]" :style="{ width: `${Math.min(card.progress, 100)}%` }" />
          </div>
        </template>
        <div v-else class="mt-3 space-y-2">
          <USkeleton class="h-7 w-20" />
          <USkeleton class="h-3 w-28" />
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-5 gap-6">
      <!-- This semester -->
      <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">This semester</h3>
          <NuxtLink to="/my/courses" class="text-sm text-emerald-700 hover:underline">All courses</NuxtLink>
        </div>
        <div v-if="!courses" class="space-y-4">
          <USkeleton v-for="i in 4" :key="i" class="h-12 w-full" />
        </div>
        <p v-else-if="!courses.length" class="text-sm text-gray-400 py-6 text-center">You are not enrolled in any course this semester.</p>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="c in courses" :key="c.enrollment_id" class="py-3 flex items-center gap-4">
            <div class="w-12 shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg py-2 text-center">{{ c.course.code }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ c.course.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ c.faculty || 'Faculty to be assigned' }} · {{ c.course.credits }} {{ c.course.credits === 1 ? 'credit' : 'credits' }}</p>
            </div>
            <div class="w-28 shrink-0 text-right">
              <p :class="['text-sm font-semibold', attendanceTone(c.attendance_percent).text]">
                {{ c.attendance_percent ?? '—' }}{{ c.attendance_percent !== null ? '%' : '' }}
              </p>
              <div class="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div :class="['h-full rounded-full', attendanceTone(c.attendance_percent).bar]" :style="{ width: `${c.attendance_percent || 0}%` }" />
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Latest results -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">Latest results</h3>
          <span v-if="latest" class="text-xs text-gray-400">{{ latest.semester }}</span>
        </div>
        <div v-if="!data" class="space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-8 w-full" />
        </div>
        <p v-else-if="!latest" class="text-sm text-gray-400 py-6 text-center">No published results yet.</p>
        <template v-else>
          <div class="flex items-baseline gap-2 mb-4">
            <span class="text-3xl font-bold text-gray-900">{{ latest.gpa?.toFixed(2) }}</span>
            <span class="text-sm text-gray-500">term GPA</span>
          </div>
          <ul class="space-y-2">
            <li v-for="g in latest.courses" :key="g.course_id" class="flex items-center justify-between gap-3">
              <span class="text-sm text-gray-700 truncate">{{ g.code }} · {{ g.name }}</span>
              <span :class="['text-xs font-bold px-2 py-0.5 rounded-md shrink-0', gradeTone(g.grade_letter)]">{{ g.grade_letter }}</span>
            </li>
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const api = useApi()
const { money, attendanceTone, gradeTone } = useAcademicFormat()

const data = ref(null)
const courses = ref(null)

const firstName = computed(() => auth.user?.name?.split(' ')[0] || '')
const term = computed(() => data.value ? `${data.value.term.semester} · ${data.value.term.academic_year}` : 'Loading your semester…')
const latest = computed(() => data.value?.latest_term || null)

const cards = computed(() => {
  const d = data.value
  if (!d) return [
    { label: 'CGPA', icon: 'i-heroicons-academic-cap', bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Credits earned', icon: 'i-heroicons-trophy', bg: 'bg-sky-50', color: 'text-sky-600' },
    { label: 'Attendance', icon: 'i-heroicons-check-circle', bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Fees due', icon: 'i-heroicons-banknotes', bg: 'bg-rose-50', color: 'text-rose-600' },
  ]
  const required = d.profile.total_credits_required || 0
  const tone = attendanceTone(d.attendance_percent)
  return [
    { label: 'CGPA', icon: 'i-heroicons-academic-cap', bg: 'bg-emerald-50', color: 'text-emerald-600', value: d.cgpa?.toFixed(2) ?? '—', hint: 'out of 4.00' },
    { label: 'Credits earned', icon: 'i-heroicons-trophy', bg: 'bg-sky-50', color: 'text-sky-600', value: d.earned_credits, hint: required ? `of ${required} required` : 'completed so far', progress: required ? (d.earned_credits / required) * 100 : undefined, bar: 'bg-sky-500' },
    { label: 'Attendance', icon: 'i-heroicons-check-circle', bg: 'bg-amber-50', color: 'text-amber-600', value: d.attendance_percent !== null ? `${d.attendance_percent}%` : '—', hint: tone.label, valueClass: tone.text, progress: d.attendance_percent ?? 0, bar: tone.bar },
    { label: 'Fees due', icon: 'i-heroicons-banknotes', bg: 'bg-rose-50', color: 'text-rose-600', value: money(d.fees_due), hint: d.next_fee_due_date ? `next due ${d.next_fee_due_date}` : 'nothing pending', valueClass: d.fees_due > 0 ? 'text-rose-600' : 'text-gray-900' },
  ]
})

onMounted(() => {
  api.get('/me/student/overview').then((res) => { data.value = res.data }).catch(() => {})
  api.get('/me/student/courses').then((res) => { courses.value = res.data }).catch(() => { courses.value = [] })
})
</script>
