<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900">My Courses</h2>
      <p class="text-sm text-gray-500 mt-1">{{ termLabel }}</p>
    </div>

    <div v-if="!courses" class="grid md:grid-cols-2 gap-4">
      <USkeleton v-for="i in 4" :key="i" class="h-40 w-full rounded-xl" />
    </div>

    <div v-else-if="!courses.length" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <UIcon name="i-heroicons-book-open" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">You are not enrolled in any course this semester.</p>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-4">
      <div v-for="c in courses" :key="c.enrollment_id" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-bold text-emerald-700">{{ c.course.code }}</p>
            <h3 class="font-semibold text-gray-900 mt-0.5">{{ c.course.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ c.faculty || 'Faculty to be assigned' }}</p>
          </div>
          <span :class="['text-xs font-medium px-2 py-1 rounded-full capitalize shrink-0', c.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
            {{ c.status === 'approved' ? 'Enrolled' : 'Awaiting approval' }}
          </span>
        </div>

        <div class="flex gap-4 mt-4 text-xs text-gray-500">
          <span>{{ c.course.credits }} {{ c.course.credits === 1 ? 'credit' : 'credits' }}</span>
          <span class="capitalize">{{ c.course.type || 'theory' }}</span>
          <span v-if="c.section">Section {{ c.section }}</span>
        </div>

        <div class="mt-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Attendance</span>
            <span :class="['font-semibold', attendanceTone(c.attendance_percent).text]">
              {{ c.attendance_percent !== null ? `${c.attendance_percent}%` : '—' }}
            </span>
          </div>
          <div class="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div :class="['h-full rounded-full', attendanceTone(c.attendance_percent).bar]" :style="{ width: `${c.attendance_percent || 0}%` }" />
          </div>
          <p :class="['text-xs mt-1.5', attendanceTone(c.attendance_percent).text]">{{ attendanceTone(c.attendance_percent).label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['student'] })

useUiStore().setPageTitle('My Courses')
const api = useApi()
const { attendanceTone } = useAcademicFormat()

const courses = ref(null)
const term = ref(null)
const termLabel = computed(() => term.value ? `${term.value.semester} · ${term.value.academic_year}` : 'Current semester')

onMounted(async () => {
  try {
    const res = await api.get('/me/student/courses')
    courses.value = res.data
    term.value = res.term
  } catch {
    courses.value = []
  }
})
</script>
