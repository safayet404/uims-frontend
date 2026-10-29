<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900">My Results</h2>
      <p class="text-sm text-gray-500 mt-1">Published {{ isCoaching ? 'test' : 'exam' }} results and report cards</p>
    </div>

    <div v-if="!results" class="space-y-4">
      <USkeleton v-for="i in 2" :key="i" class="h-48 w-full rounded-xl" />
    </div>
    <p v-else-if="!results.length" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">No results have been published yet.</p>

    <div v-for="r in results || []" :key="r.exam.id" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="flex flex-wrap items-start justify-between gap-4 p-5 border-b border-gray-100">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ r.exam.name }}</h3>
          <p class="text-sm text-gray-500">{{ r.group }} · {{ r.exam.academic_year }}</p>
        </div>
        <div class="flex gap-2">
          <button type="button" :disabled="busy" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" @click="download(r)">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" /> Report card
          </button>
          <button type="button" :disabled="busy" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" @click="print(r)">
            <UIcon name="i-heroicons-printer" class="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 border-b border-gray-100">
        <div v-if="r.mode === 'gpa5'" class="bg-white px-5 py-3">
          <p class="text-xs text-gray-500">GPA</p>
          <p class="text-xl font-bold" :class="r.result.status === 'failed' ? 'text-rose-600' : 'text-emerald-700'">{{ r.result.gpa?.toFixed(2) ?? '—' }} <span class="text-sm font-medium">{{ r.result.letter }}</span></p>
        </div>
        <div class="bg-white px-5 py-3">
          <p class="text-xs text-gray-500">Total</p>
          <p class="text-xl font-bold text-gray-900">{{ r.result.total }}<span class="text-sm font-normal text-gray-400">/{{ r.result.full_total }}</span></p>
        </div>
        <div class="bg-white px-5 py-3">
          <p class="text-xs text-gray-500">Result</p>
          <p class="text-xl font-bold" :class="r.result.status === 'failed' ? 'text-rose-600' : 'text-gray-900'">{{ r.result.status === 'passed' ? 'Passed' : r.result.status === 'failed' ? 'Failed' : 'Incomplete' }}</p>
        </div>
        <div v-if="r.mode !== 'remarks'" class="bg-white px-5 py-3">
          <p class="text-xs text-gray-500">Position</p>
          <p class="text-xl font-bold text-gray-900">{{ r.result.section_position ?? '—' }}<span class="text-sm font-normal text-gray-400"> of {{ r.group_size }}</span></p>
          <p v-if="r.result.class_position" class="text-xs text-gray-400">{{ r.result.class_position }} in the whole class</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/60">
              <th class="px-5 py-2.5 font-medium">Subject</th>
              <th class="px-3 py-2.5 font-medium text-right">Marks</th>
              <th v-if="r.mode === 'gpa5'" class="px-3 py-2.5 font-medium text-center">Grade</th>
              <th v-if="r.mode === 'gpa5'" class="px-5 py-2.5 font-medium text-right">Point</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="s in r.result.subjects" :key="s.subject_id">
              <td class="px-5 py-2.5 text-gray-900">{{ s.name }} <span v-if="s.is_fourth" class="text-xs text-amber-700">(4th)</span></td>
              <td class="px-3 py-2.5 text-right" :class="s.letter === 'F' ? 'text-rose-600 font-semibold' : 'text-gray-800'">
                {{ s.is_absent ? 'Absent' : (s.marks ?? '—') }}<span class="text-gray-400">/{{ s.full_marks }}</span>
              </td>
              <td v-if="r.mode === 'gpa5'" class="px-3 py-2.5 text-center">
                <span :class="['inline-flex px-2 py-0.5 rounded-md text-xs font-semibold', gradeTone(s.letter)]">{{ s.letter ?? '—' }}</span>
              </td>
              <td v-if="r.mode === 'gpa5'" class="px-5 py-2.5 text-right text-gray-600">{{ s.point?.toFixed(2) ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="r.result.remarks" class="px-5 py-3 border-t border-gray-100 text-sm text-gray-700">
        <span class="text-gray-500">{{ isCoaching ? "Teacher's" : "Class teacher's" }} remarks:</span> {{ r.result.remarks }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['student'] })
useUiStore().setPageTitle('My Results')

const api = useApi()
const pdf = usePdf()
const { isCoaching } = useInstitution()
const { gradeTone } = useAcademicFormat()

const results = ref(null)
const busy = ref(false)
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const path = (r, inline) => `/me/student/exam-results/${r.exam.id}/report-card${inline ? '?inline=1' : ''}`
const withPdf = async (fn) => { busy.value = true; try { await fn() } finally { busy.value = false } }
const download = r => withPdf(() => pdf.download(path(r), `${slug(r.exam.name)}-report-card.pdf`))
const print = r => withPdf(() => pdf.print(path(r, true)))

onMounted(async () => {
  try { results.value = (await api.get('/me/student/exam-results')).data } catch { results.value = [] }
})
</script>
