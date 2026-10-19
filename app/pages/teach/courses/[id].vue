<template>
  <div class="space-y-6">
    <NuxtLink to="/teach/courses" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
      <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" /> My Classes
    </NuxtLink>

    <div v-if="course" class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-bold text-emerald-700">{{ course.code }}</p>
        <h2 class="text-xl font-bold text-gray-900">{{ course.name }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ termLabel }} · {{ course.students }} students · {{ course.sessions_held }} classes held</p>
      </div>
    </div>
    <USkeleton v-else-if="!notFound" class="h-14 w-80" />
    <div v-else class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
      This course is not assigned to you.
    </div>

    <template v-if="course">
      <div class="flex gap-1 border-b border-gray-200">
        <button v-for="t in tabs" :key="t.key" type="button" @click="tab = t.key"
          :class="['px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', tab === t.key ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800']">
          {{ t.label }}
        </button>
      </div>

      <!-- Students -->
      <div v-if="tab === 'students'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <TableSkeleton v-if="!roster" :rows="5" />
        <p v-else-if="!roster.length" class="p-12 text-center text-gray-500">No students are enrolled yet.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/60">
                <th class="px-5 py-3 font-medium">Student</th>
                <th class="px-3 py-3 font-medium text-center">Present</th>
                <th class="px-3 py-3 font-medium text-center">Late</th>
                <th class="px-3 py-3 font-medium text-center">Absent</th>
                <th class="px-3 py-3 font-medium text-center">Excused</th>
                <th class="px-5 py-3 font-medium w-48">Attendance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in roster" :key="s.student_profile_id">
                <td class="px-5 py-3">
                  <p class="font-medium text-gray-900">{{ s.name }}</p>
                  <p class="text-xs text-gray-400">{{ s.student_id }}</p>
                </td>
                <td class="px-3 py-3 text-center text-gray-700">{{ s.present }}</td>
                <td class="px-3 py-3 text-center text-gray-700">{{ s.late }}</td>
                <td class="px-3 py-3 text-center text-gray-700">{{ s.absent }}</td>
                <td class="px-3 py-3 text-center text-gray-700">{{ s.excused }}</td>
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div :class="['h-full rounded-full', attendanceTone(s.percentage).bar]" :style="{ width: `${s.percentage}%` }" />
                    </div>
                    <span :class="['text-xs font-semibold w-10 text-right', attendanceTone(s.percentage).text]">{{ Math.round(s.percentage) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Take attendance -->
      <div v-if="tab === 'attendance'" class="bg-white rounded-xl border border-gray-200">
        <div class="flex flex-wrap items-end gap-4 p-5 border-b border-gray-100">
          <label class="text-sm">
            <span class="block text-gray-600 mb-1">Date</span>
            <input v-model="attendanceDate" type="date" :max="todayIso" class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          </label>
          <label class="text-sm flex-1 min-w-48">
            <span class="block text-gray-600 mb-1">Topic (optional)</span>
            <input v-model="topic" type="text" placeholder="e.g. Binary search trees" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          </label>
          <button type="button" class="text-sm font-medium text-emerald-700 hover:underline pb-2" @click="markAll('present')">Mark all present</button>
        </div>

        <p v-if="existingSession" class="mx-5 mt-4 rounded-lg bg-sky-50 px-4 py-2 text-sm text-sky-800">
          Attendance for this date was already taken. Saving will update it.
        </p>

        <TableSkeleton v-if="!sheet" :rows="5" :cols="3" />
        <p v-else-if="!sheet.length" class="p-12 text-center text-gray-500">No students are enrolled yet.</p>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="s in sheet" :key="s.student_profile_id" class="flex flex-wrap items-center gap-3 px-5 py-3">
            <div class="flex-1 min-w-40">
              <p class="text-sm font-medium text-gray-900">{{ s.name }}</p>
              <p class="text-xs text-gray-400">{{ s.student_id }}</p>
            </div>
            <div class="flex gap-1" role="radiogroup" :aria-label="`Attendance for ${s.name}`">
              <button v-for="opt in statusOptions" :key="opt.value" type="button" role="radio" :aria-checked="s.status === opt.value"
                :title="opt.label" @click="s.status = opt.value"
                :class="['w-9 h-9 rounded-lg text-sm font-semibold transition-colors', s.status === opt.value ? opt.active : 'bg-gray-50 text-gray-400 hover:bg-gray-100']">
                {{ opt.short }}
              </button>
            </div>
          </li>
        </ul>

        <div v-if="sheet?.length" class="flex flex-wrap items-center justify-between gap-3 p-5 border-t border-gray-100">
          <p class="text-sm text-gray-500">
            <span v-for="opt in statusOptions" :key="opt.value" class="mr-3">{{ opt.label }}: <b class="text-gray-900">{{ counts[opt.value] || 0 }}</b></span>
          </p>
          <UButton :loading="savingAttendance" class="bg-emerald-600 hover:bg-emerald-500" @click="saveAttendance">Save attendance</UButton>
        </div>
      </div>

      <!-- Grades -->
      <div v-if="tab === 'grades'" class="bg-white rounded-xl border border-gray-200">
        <div class="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100">
          <div>
            <p class="font-medium text-gray-900">Final marks out of 100</p>
            <p class="text-xs text-gray-500">Grades follow the university scale (80+ = A+, 75+ = A …). Students only see published results.</p>
          </div>
          <span v-if="allPublished" class="text-xs font-medium px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">Results published</span>
        </div>

        <TableSkeleton v-if="!gradeSheet" :rows="5" :cols="3" />
        <p v-else-if="!gradeSheet.length" class="p-12 text-center text-gray-500">No students are enrolled yet.</p>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="s in gradeSheet" :key="s.student_profile_id" class="flex flex-wrap items-center gap-3 px-5 py-3">
            <div class="flex-1 min-w-40">
              <p class="text-sm font-medium text-gray-900">{{ s.name }}</p>
              <p class="text-xs text-gray-400">{{ s.student_id }}</p>
            </div>
            <input v-model.number="s.total_marks" type="number" min="0" max="100" step="0.5" placeholder="—"
              :aria-label="`Marks for ${s.name}`"
              class="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <span :class="['w-12 text-center text-xs font-bold px-2 py-1 rounded-md', gradeTone(letterFor(s.total_marks))]">{{ letterFor(s.total_marks) || '—' }}</span>
          </li>
        </ul>

        <div v-if="gradeSheet?.length" class="flex flex-wrap items-center justify-between gap-3 p-5 border-t border-gray-100">
          <p class="text-sm text-gray-500">{{ gradedCount }} of {{ gradeSheet.length }} students have marks</p>
          <div class="flex gap-2">
            <UButton color="neutral" variant="outline" :loading="savingGrades" @click="saveGrades">Save draft</UButton>
            <UButton :loading="publishing" :disabled="!gradedCount" class="bg-emerald-600 hover:bg-emerald-500" @click="publishGrades">Publish results</UButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['faculty'] })

const route = useRoute()
const ui = useUiStore()
const api = useApi()
const toast = useToast()
const { attendanceTone, gradeTone } = useAcademicFormat()

ui.setPageTitle('Class')

const tabs = [
  { key: 'students', label: 'Students' },
  { key: 'attendance', label: 'Take attendance' },
  { key: 'grades', label: 'Grades' },
]
const tab = ref(tabs.some(t => t.key === route.query.tab) ? route.query.tab : 'students')

const course = ref(null)
const term = ref(null)
const notFound = ref(false)
const termLabel = computed(() => term.value ? `${term.value.semester} · ${term.value.academic_year}` : '')
const scope = computed(() => ({ course_id: course.value?.id, semester: term.value?.semester, academic_year: term.value?.academic_year }))

// Same scale as the backend (ExamResult::calculateGrade)
const SCALE = [[80, 'A+'], [75, 'A'], [70, 'A-'], [65, 'B+'], [60, 'B'], [55, 'B-'], [50, 'C+'], [45, 'C'], [40, 'D']]
const letterFor = (marks) => {
  if (marks === null || marks === undefined || marks === '') return null
  return (SCALE.find(([min]) => marks >= min) || [0, 'F'])[1]
}

// ── Students ────────────────────────────────────────────────
const roster = ref(null)
const loadRoster = async () => {
  roster.value = null
  try { roster.value = (await api.get('/attendance/report', scope.value)).data } catch { roster.value = [] }
}

// ── Attendance ──────────────────────────────────────────────
const todayIso = new Date().toISOString().slice(0, 10)
const attendanceDate = ref(todayIso)
const topic = ref('')
const sheet = ref(null)
const existingSession = ref(null)
const savingAttendance = ref(false)
const statusOptions = [
  { value: 'present', short: 'P', label: 'Present', active: 'bg-emerald-600 text-white' },
  { value: 'late', short: 'L', label: 'Late', active: 'bg-amber-500 text-white' },
  { value: 'absent', short: 'A', label: 'Absent', active: 'bg-red-500 text-white' },
  { value: 'excused', short: 'E', label: 'Excused', active: 'bg-sky-500 text-white' },
]
const counts = computed(() => (sheet.value || []).reduce((acc, s) => ({ ...acc, [s.status]: (acc[s.status] || 0) + 1 }), {}))
const markAll = status => (sheet.value || []).forEach((s) => { s.status = status })

const loadSheet = async () => {
  sheet.value = null
  try {
    const res = await api.get('/attendance/students', { ...scope.value, date: attendanceDate.value })
    sheet.value = res.students
    existingSession.value = res.existing_session
  } catch { sheet.value = [] }
}

const saveAttendance = async () => {
  savingAttendance.value = true
  try {
    await api.post('/attendance/mark', {
      ...scope.value,
      date: attendanceDate.value,
      topic: topic.value || null,
      records: sheet.value.map(s => ({ student_profile_id: s.student_profile_id, status: s.status })),
    })
    toast.add({ title: 'Attendance saved', color: 'success' })
    existingSession.value = { id: true }
    roster.value = null
  } catch { /* useApi already shows the error */ } finally {
    savingAttendance.value = false
  }
}

// ── Grades ──────────────────────────────────────────────────
const gradeSheet = ref(null)
const savingGrades = ref(false)
const publishing = ref(false)
const gradedCount = computed(() => (gradeSheet.value || []).filter(s => typeof s.total_marks === 'number').length)
const allPublished = computed(() => gradeSheet.value?.length && gradeSheet.value.every(s => s.is_published))

const loadGrades = async () => {
  gradeSheet.value = null
  try {
    gradeSheet.value = (await api.get('/grades/course', scope.value)).data
      .map(s => ({ ...s, total_marks: s.total_marks === null ? null : Number(s.total_marks) }))
  } catch { gradeSheet.value = [] }
}

const saveGrades = async () => {
  savingGrades.value = true
  try {
    await api.post('/grades/save', {
      ...scope.value,
      grades: gradeSheet.value
        .filter(s => typeof s.total_marks === 'number')
        .map(s => ({ enrollment_id: s.enrollment_id, student_profile_id: s.student_profile_id, total_marks: s.total_marks })),
    })
    toast.add({ title: 'Grades saved as draft', description: 'Students will see them once you publish.', color: 'success' })
    return true
  } catch { return false } finally {
    savingGrades.value = false
  }
}

const publishGrades = async () => {
  if (!confirm(`Publish results for ${course.value.code}? Students will see their grades immediately.`)) return
  publishing.value = true
  try {
    if (!(await saveGrades())) return
    await api.post('/grades/publish', scope.value)
    toast.add({ title: 'Results published', color: 'success' })
    await loadGrades()
  } catch { /* useApi already shows the error */ } finally {
    publishing.value = false
  }
}

// ── Loading ─────────────────────────────────────────────────
const loadTab = () => {
  if (!course.value) return
  if (tab.value === 'students' && !roster.value) loadRoster()
  if (tab.value === 'attendance') loadSheet()
  if (tab.value === 'grades' && !gradeSheet.value) loadGrades()
}

watch(tab, loadTab)
watch(attendanceDate, () => { if (tab.value === 'attendance') loadSheet() })

onMounted(async () => {
  try {
    const res = await api.get('/me/faculty/courses')
    term.value = res.term
    course.value = res.data.find(c => String(c.id) === String(route.params.id)) || null
    notFound.value = !course.value
    if (course.value) ui.setPageTitle(course.value.code)
    loadTab()
  } catch {
    notFound.value = true
  }
})
</script>
