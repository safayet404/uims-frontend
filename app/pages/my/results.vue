<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Results</h2>
        <p class="text-sm text-gray-500 mt-1">Published grades by semester</p>
      </div>
      <div v-if="report" class="flex gap-3">
        <div class="bg-white rounded-xl border border-gray-200 px-5 py-3 text-center">
          <p class="text-2xl font-bold text-emerald-700">{{ report.cgpa?.toFixed(2) ?? '—' }}</p>
          <p class="text-xs text-gray-500">CGPA</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 px-5 py-3 text-center">
          <p class="text-2xl font-bold text-gray-900">{{ report.earned_credits }}</p>
          <p class="text-xs text-gray-500">Credits earned</p>
        </div>
      </div>
    </div>

    <div v-if="!report" class="space-y-4">
      <USkeleton v-for="i in 2" :key="i" class="h-56 w-full rounded-xl" />
    </div>

    <div v-else-if="!report.terms.length" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <UIcon name="i-heroicons-academic-cap" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No results have been published yet.</p>
    </div>

    <div v-for="t in [...(report?.terms || [])].reverse()" :key="t.semester + t.academic_year" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <div>
          <h3 class="font-semibold text-gray-900">{{ t.semester }}</h3>
          <p class="text-xs text-gray-500">{{ t.academic_year }} · {{ t.credits }} credits</p>
        </div>
        <p class="text-sm text-gray-600">Term GPA <span class="ml-1 text-lg font-bold text-gray-900">{{ t.gpa?.toFixed(2) ?? '—' }}</span></p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase tracking-wide">
              <th class="px-5 py-3 font-medium">Course</th>
              <th class="px-5 py-3 font-medium text-center">Credits</th>
              <th class="px-5 py-3 font-medium text-center">Marks</th>
              <th class="px-5 py-3 font-medium text-center">Grade</th>
              <th class="px-5 py-3 font-medium text-right">Point</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="g in t.courses" :key="g.course_id">
              <td class="px-5 py-3">
                <p class="font-medium text-gray-900">{{ g.name }}</p>
                <p class="text-xs text-gray-400">{{ g.code }}</p>
              </td>
              <td class="px-5 py-3 text-center text-gray-600">{{ g.credits }}</td>
              <td class="px-5 py-3 text-center text-gray-600">{{ g.total_marks ?? '—' }}</td>
              <td class="px-5 py-3 text-center">
                <span :class="['text-xs font-bold px-2 py-0.5 rounded-md', gradeTone(g.grade_letter)]">{{ g.grade_letter || '—' }}</span>
              </td>
              <td class="px-5 py-3 text-right font-medium text-gray-900">{{ g.grade_point?.toFixed(2) ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['student'] })

useUiStore().setPageTitle('Results')
const api = useApi()
const { gradeTone } = useAcademicFormat()

const report = ref(null)

onMounted(async () => {
  try {
    report.value = (await api.get('/me/student/grades')).data
  } catch {
    report.value = { cgpa: null, earned_credits: 0, terms: [] }
  }
})
</script>
