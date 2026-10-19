<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900">My Classes</h2>
      <p class="text-sm text-gray-500 mt-1">{{ termLabel }}</p>
    </div>

    <div v-if="!courses" class="grid md:grid-cols-2 gap-4">
      <USkeleton v-for="i in 2" :key="i" class="h-44 w-full rounded-xl" />
    </div>

    <div v-else-if="!courses.length" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <UIcon name="i-heroicons-academic-cap" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No courses are assigned to you this semester.</p>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-4">
      <NuxtLink v-for="c in courses" :key="c.id" :to="`/teach/courses/${c.id}`"
        class="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-bold text-emerald-700">{{ c.code }}</p>
            <h3 class="font-semibold text-gray-900 mt-0.5">{{ c.name }}</h3>
            <p class="text-xs text-gray-500 mt-1 capitalize">{{ c.credits }} {{ c.credits === 1 ? 'credit' : 'credits' }} · {{ c.type || 'theory' }}</p>
          </div>
          <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-300 shrink-0" />
        </div>
        <dl class="grid grid-cols-3 gap-3 mt-5 text-center">
          <div class="rounded-lg bg-gray-50 py-2">
            <dt class="text-xs text-gray-500">Students</dt>
            <dd class="text-lg font-bold text-gray-900">{{ c.students }}</dd>
          </div>
          <div class="rounded-lg bg-gray-50 py-2">
            <dt class="text-xs text-gray-500">Classes</dt>
            <dd class="text-lg font-bold text-gray-900">{{ c.sessions_held }}</dd>
          </div>
          <div class="rounded-lg bg-gray-50 py-2">
            <dt class="text-xs text-gray-500">Attendance</dt>
            <dd :class="['text-lg font-bold', attendanceTone(c.attendance_percent).text]">{{ c.attendance_percent !== null ? `${c.attendance_percent}%` : '—' }}</dd>
          </div>
        </dl>
        <p class="text-xs mt-4" :class="c.grades_published ? 'text-sky-700' : c.grades_entered ? 'text-amber-700' : 'text-gray-500'">
          {{ c.grades_published ? 'Results published' : c.grades_entered ? `${c.grades_entered} of ${c.students} students graded — not published` : 'Grades not entered yet' }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['faculty'] })

useUiStore().setPageTitle('My Classes')
const api = useApi()
const { attendanceTone } = useAcademicFormat()

const courses = ref(null)
const term = ref(null)
const termLabel = computed(() => term.value ? `${term.value.semester} · ${term.value.academic_year}` : 'Current semester')

onMounted(async () => {
  try {
    const res = await api.get('/me/faculty/courses')
    courses.value = res.data
    term.value = res.term
  } catch {
    courses.value = []
  }
})
</script>
