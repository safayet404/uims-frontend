<template>
  <div class="space-y-6">
    <div class="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-700 to-teal-600 p-6 text-white">
      <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
      <div class="relative">
        <p class="text-emerald-100 text-sm">{{ termLabel }}</p>
        <h2 class="text-2xl font-bold mt-1">Good {{ timeOfDay }}, {{ firstName }} 👋</h2>
        <p v-if="data" class="text-emerald-50/90 mt-1 text-sm">
          {{ data.profile.designation }} · {{ data.profile.department }} · {{ data.profile.employee_id }}
        </p>
        <USkeleton v-else class="h-4 w-64 mt-2 bg-white/20" />
      </div>
    </div>

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
        </template>
        <div v-else class="mt-3 space-y-2">
          <USkeleton class="h-7 w-16" />
          <USkeleton class="h-3 w-24" />
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">My classes</h3>
          <NuxtLink to="/teach/courses" class="text-sm text-emerald-700 hover:underline">Open classes</NuxtLink>
        </div>
        <div v-if="!data" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-14 w-full" />
        </div>
        <p v-else-if="!data.courses.length" class="text-sm text-gray-400 py-6 text-center">No courses are assigned to you this semester.</p>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="c in data.courses" :key="c.id">
            <NuxtLink :to="`/teach/courses/${c.id}`" class="py-3 flex items-center gap-4 group">
              <div class="w-14 shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg py-2 text-center">{{ c.code }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700">{{ c.name }}</p>
                <p class="text-xs text-gray-400">{{ c.students }} students · {{ c.sessions_held }} classes held</p>
              </div>
              <span :class="['text-xs font-medium px-2 py-1 rounded-full shrink-0', gradingBadge(c).class]">{{ gradingBadge(c).label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">Today's classes</h3>
          <span class="text-xs text-gray-400">{{ data?.today }}</span>
        </div>
        <div v-if="!data" class="space-y-3">
          <USkeleton v-for="i in 2" :key="i" class="h-14 w-full" />
        </div>
        <p v-else-if="!data.today_classes.length" class="text-sm text-gray-400 py-6 text-center">No classes today.</p>
        <ul v-else class="space-y-2">
          <li v-for="s in data.today_classes" :key="s.course.code + s.start_time" class="rounded-lg bg-gray-50 px-3 py-2.5">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-semibold text-gray-900">{{ s.course.code }} · {{ s.course.name }}</p>
              <p class="text-xs font-medium text-gray-500 shrink-0">{{ s.start_time }}–{{ s.end_time }}</p>
            </div>
            <div class="flex items-center justify-between mt-1">
              <p class="text-xs text-gray-400">{{ [s.room, s.building].filter(Boolean).join(', ') || 'Room TBA' }}</p>
              <NuxtLink :to="`/teach/courses/${s.course.id}?tab=attendance`" class="text-xs font-medium text-emerald-700 hover:underline">Take attendance →</NuxtLink>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const api = useApi()
const { attendanceTone } = useAcademicFormat()

const data = ref(null)

const firstName = computed(() => auth.user?.name?.replace(/^(Dr|Prof)\.?\s+/i, '').split(' ')[0] || '')
const termLabel = computed(() => data.value ? `${data.value.term.semester} · ${data.value.term.academic_year}` : 'Loading your semester…')
const timeOfDay = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
})

const gradingBadge = c => c.grades_published
  ? { label: 'Results published', class: 'bg-sky-50 text-sky-700' }
  : c.grades_entered
    ? { label: `${c.grades_entered}/${c.students} graded`, class: 'bg-amber-50 text-amber-700' }
    : { label: 'Not graded', class: 'bg-gray-100 text-gray-600' }

const cards = computed(() => {
  const d = data.value
  const base = [
    { label: 'Courses', icon: 'i-heroicons-book-open', bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Students', icon: 'i-heroicons-user-group', bg: 'bg-sky-50', color: 'text-sky-600' },
    { label: 'Avg. attendance', icon: 'i-heroicons-check-circle', bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Grading pending', icon: 'i-heroicons-pencil-square', bg: 'bg-rose-50', color: 'text-rose-600' },
  ]
  if (!d) return base
  const tone = attendanceTone(d.attendance_percent)
  return [
    { ...base[0], value: d.courses_count, hint: 'this semester' },
    { ...base[1], value: d.students_count, hint: `${d.sessions_held} classes held` },
    { ...base[2], value: d.attendance_percent !== null ? `${d.attendance_percent}%` : '—', hint: 'across your classes', valueClass: tone.text },
    { ...base[3], value: d.grading_pending, hint: d.grading_pending ? 'courses not yet published' : 'all results published', valueClass: d.grading_pending ? 'text-rose-600' : 'text-gray-900' },
  ]
})

onMounted(() => {
  api.get('/me/faculty/overview').then((res) => { data.value = res.data }).catch(() => {})
})
</script>
