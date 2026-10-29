<template>
  <div class="space-y-6">
    <NuxtLink to="/term-exams" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
      <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" /> {{ isCoaching ? 'Tests & Results' : 'Exams & Results' }}
    </NuxtLink>

    <USkeleton v-if="!exam" class="h-16 w-96" />
    <div v-else class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-xl font-bold text-gray-900">{{ exam.name }}</h2>
          <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium', published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
            {{ published ? 'Published' : 'Draft' }}
          </span>
        </div>
        <p class="text-sm text-gray-500 mt-1">
          {{ exam.sits }} · {{ exam.academic_year }}<span v-if="exam.full_marks"> · out of {{ exam.full_marks }}</span>
        </p>
      </div>
      <div v-if="canManage" class="flex gap-2">
        <button v-if="!published" type="button" :disabled="busy" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50" @click="setPublished(true)">
          <UIcon name="i-heroicons-check-badge" class="w-4 h-4" /> Publish results
        </button>
        <button v-else type="button" :disabled="busy" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" @click="setPublished(false)">
          Unpublish
        </button>
      </div>
    </div>

    <p v-if="exam && published" class="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
      Results are published, so marks and remarks are locked.<span v-if="canManage"> Unpublish to make changes.</span>
    </p>

    <template v-if="exam">
      <p v-if="!exam.groups.length" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
        {{ canManage ? `No ${terms.groups.toLowerCase()} sit this ${isCoaching ? 'test' : 'exam'} yet.` : `You do not teach any ${terms.groups.toLowerCase()} that sit this ${isCoaching ? 'test' : 'exam'}.` }}
      </p>

      <template v-else>
        <div v-if="exam.groups.length > 1" class="flex flex-wrap gap-2" role="tablist" :aria-label="terms.groups">
          <button v-for="g in exam.groups" :key="g.id" type="button" role="tab" :aria-selected="g.id === groupId"
            :class="['px-3 py-1.5 rounded-full text-sm font-medium border transition-colors', g.id === groupId ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300']"
            @click="selectGroup(g.id)">
            {{ g.display_name }}
          </button>
        </div>

        <div class="flex gap-1 border-b border-gray-200">
          <button v-for="t in tabs" :key="t.key" type="button" @click="setTab(t.key)"
            :class="['px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', tab === t.key ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800']">
            {{ t.label }}
          </button>
        </div>

        <!-- Marks entry: subject list -->
        <div v-if="tab === 'marks' && !sheetSubject" class="bg-white rounded-xl border border-gray-200">
          <p v-if="!group.subjects.length" class="p-12 text-center text-gray-500">This {{ terms.group.toLowerCase() }} has no subjects yet.</p>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="s in group.subjects" :key="s.id" class="flex flex-wrap items-center gap-4 px-5 py-3">
              <div class="flex-1 min-w-40">
                <p class="text-sm font-medium text-gray-900">{{ s.name }}</p>
                <p class="text-xs text-gray-400">{{ s.teacher || 'No teacher assigned' }} · out of {{ s.full_marks }}</p>
              </div>
              <div class="flex items-center gap-2 w-44">
                <div class="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div :class="['h-full rounded-full', s.entered >= s.expected ? 'bg-emerald-500' : 'bg-amber-400']" :style="{ width: `${s.expected ? (s.entered / s.expected) * 100 : 0}%` }" />
                </div>
                <span class="text-xs text-gray-500 w-14 text-right">{{ s.entered }}/{{ s.expected }}</span>
              </div>
              <button v-if="s.can_enter" type="button" class="w-28 px-3 py-1.5 text-sm font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50" @click="openSheet(s)">
                {{ published ? 'View marks' : 'Enter marks' }}
              </button>
              <span v-else class="w-28" />
            </li>
          </ul>
        </div>

        <!-- Marks entry: one subject -->
        <div v-if="tab === 'marks' && sheetSubject" class="bg-white rounded-xl border border-gray-200">
          <div class="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100">
            <div>
              <button type="button" class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900" @click="closeSheet">
                <UIcon name="i-heroicons-arrow-left" class="w-3 h-3" /> All subjects
              </button>
              <h3 class="font-semibold text-gray-900">{{ sheetSubject.name }}</h3>
              <p v-if="sheet" class="text-xs text-gray-500">Full marks {{ sheet.subject.full_marks }} · pass marks {{ sheet.subject.pass_marks }} · leave blank if not marked yet</p>
            </div>
          </div>
          <TableSkeleton v-if="!sheet" :rows="5" :cols="3" />
          <p v-else-if="!sheet.students.length" class="p-12 text-center text-gray-500">No students take this subject.</p>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="(s, i) in sheet.students" :key="s.student_profile_id" class="flex flex-wrap items-center gap-3 px-5 py-2.5">
              <span class="w-10 text-sm font-semibold text-gray-500">{{ s.roll_number }}</span>
              <div class="flex-1 min-w-40">
                <p class="text-sm font-medium text-gray-900">{{ s.name }}</p>
                <p class="text-xs text-gray-400">{{ s.student_id }}</p>
              </div>
              <input :ref="el => (markInputs[i] = el)" v-model.number="s.marks" type="number" min="0" :max="sheet.subject.full_marks" step="0.5"
                :disabled="s.is_absent || sheet.locked" :aria-label="`Marks for ${s.name}`"
                :class="['w-24 rounded-lg border px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50',
                  isFail(s) ? 'border-red-300 text-red-700' : 'border-gray-200']"
                @keydown.enter.prevent="markInputs[i + 1]?.focus()">
              <label class="flex items-center gap-1.5 text-sm text-gray-600 w-24">
                <input v-model="s.is_absent" type="checkbox" :disabled="sheet.locked" class="rounded text-emerald-600" @change="s.is_absent && (s.marks = null)"> Absent
              </label>
            </li>
          </ul>
          <div v-if="sheet?.students.length && !sheet.locked" class="flex flex-wrap items-center justify-between gap-3 p-5 border-t border-gray-100">
            <p class="text-sm text-gray-500">
              Entered <b class="text-gray-900">{{ sheet.students.filter(s => s.is_absent || isNumber(s.marks)).length }}</b> of {{ sheet.students.length }}
              <span v-if="overMax" class="ml-2 text-red-600">Some marks are above {{ sheet.subject.full_marks }}.</span>
            </p>
            <button type="button" :disabled="savingMarks || overMax" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50" @click="saveMarks">
              {{ savingMarks ? 'Saving…' : 'Save marks' }}
            </button>
          </div>
        </div>

        <!-- Results -->
        <div v-if="tab === 'results'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
            <p v-if="results" class="text-sm text-gray-500">
              <span class="mr-3">Passed: <b class="text-emerald-700">{{ counts.passed || 0 }}</b></span>
              <span class="mr-3">Failed: <b class="text-red-600">{{ counts.failed || 0 }}</b></span>
              <span v-if="counts.incomplete">Missing marks: <b class="text-amber-600">{{ counts.incomplete }}</b></span>
            </p>
            <span v-else />
            <div v-if="results?.students.length" class="flex gap-2">
              <button type="button" :disabled="pdfBusy" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" @click="downloadAll">
                <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" /> Download all
              </button>
              <button type="button" :disabled="pdfBusy" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" @click="printAll">
                <UIcon name="i-heroicons-printer" class="w-4 h-4" /> Print all
              </button>
            </div>
          </div>
          <TableSkeleton v-if="!results" :rows="5" :cols="6" />
          <p v-else-if="!results.students.length" class="p-12 text-center text-gray-500">No students yet.</p>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/60">
                  <th class="px-4 py-3 font-medium w-14">Roll</th>
                  <th class="px-4 py-3 font-medium">Student</th>
                  <th v-for="s in results.subjects" :key="s.id" class="px-2 py-3 font-medium text-center whitespace-nowrap" :title="s.name">{{ short(s.name) }}</th>
                  <th class="px-3 py-3 font-medium text-center">Total</th>
                  <th v-if="mode === 'gpa5'" class="px-3 py-3 font-medium text-center">GPA</th>
                  <th v-if="mode === 'marks'" class="px-3 py-3 font-medium text-center">%</th>
                  <th class="px-3 py-3 font-medium text-center">Result</th>
                  <th v-if="mode !== 'remarks'" class="px-3 py-3 font-medium text-center" :title="`Position in ${terms.group.toLowerCase()}`">Pos.</th>
                  <th v-if="mode === 'gpa5'" class="px-3 py-3 font-medium text-center" title="Position in the whole class">Class pos.</th>
                  <th class="px-4 py-3 font-medium min-w-56">Remarks</th>
                  <th class="px-4 py-3 font-medium text-right">Report card</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="r in results.students" :key="r.student_profile_id">
                  <td class="px-4 py-2 text-gray-500">{{ r.roll_number }}</td>
                  <td class="px-4 py-2">
                    <p class="font-medium text-gray-900 whitespace-nowrap">{{ r.name }}</p>
                    <p class="text-xs text-gray-400">{{ r.student_id }}</p>
                  </td>
                  <td v-for="s in results.subjects" :key="s.id" class="px-2 py-2 text-center whitespace-nowrap">
                    <template v-if="subjectOf(r, s.id)">
                      <span :class="subjectOf(r, s.id).letter === 'F' ? 'text-red-600 font-semibold' : 'text-gray-800'">
                        {{ subjectOf(r, s.id).is_absent ? 'Abs' : (subjectOf(r, s.id).marks ?? '—') }}
                      </span>
                      <span v-if="mode === 'gpa5' && subjectOf(r, s.id).letter" class="block text-[11px] text-gray-400">{{ subjectOf(r, s.id).letter }}</span>
                    </template>
                    <span v-else class="text-gray-300">·</span>
                  </td>
                  <td class="px-3 py-2 text-center font-medium">{{ r.total }}</td>
                  <td v-if="mode === 'gpa5'" class="px-3 py-2 text-center">
                    <span v-if="r.gpa !== null" :class="['inline-flex px-2 py-0.5 rounded-md text-xs font-semibold', gradeTone(r.letter)]">{{ r.gpa.toFixed(2) }}</span>
                    <span v-else class="text-gray-300">—</span>
                  </td>
                  <td v-if="mode === 'marks'" class="px-3 py-2 text-center">{{ r.percent ?? '—' }}</td>
                  <td class="px-3 py-2 text-center">
                    <span :class="['text-xs font-medium', statusTone[r.status]]">{{ statusLabel(r) }}</span>
                  </td>
                  <td v-if="mode !== 'remarks'" class="px-3 py-2 text-center font-semibold text-gray-700">{{ r.section_position ?? '—' }}</td>
                  <td v-if="mode === 'gpa5'" class="px-3 py-2 text-center text-gray-600">{{ r.class_position ?? '—' }}</td>
                  <td class="px-4 py-2">
                    <input v-if="canRemark" v-model="remarks[r.student_profile_id]" maxlength="500" placeholder="Add remarks" :aria-label="`Remarks for ${r.name}`"
                      class="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <span v-else class="text-gray-600">{{ r.remarks || '—' }}</span>
                  </td>
                  <td class="px-4 py-2 text-right whitespace-nowrap">
                    <button type="button" :disabled="pdfBusy" class="p-1.5 text-gray-500 hover:text-emerald-700 disabled:opacity-50" :aria-label="`Download report card of ${r.name}`" title="Download PDF" @click="downloadOne(r)">
                      <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                    </button>
                    <button type="button" :disabled="pdfBusy" class="p-1.5 text-gray-500 hover:text-emerald-700 disabled:opacity-50" :aria-label="`Print report card of ${r.name}`" title="Print" @click="printOne(r)">
                      <UIcon name="i-heroicons-printer" class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="canRemark && results?.students.length" class="flex justify-end p-4 border-t border-gray-100">
            <button type="button" :disabled="savingRemarks || !remarksChanged" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50" @click="saveRemarks">
              {{ savingRemarks ? 'Saving…' : 'Save remarks' }}
            </button>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', permission: 'grades.read' })

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const api = useApi()
const toast = useToast()
const pdf = usePdf()
const { can } = usePermission()
const { isCoaching, terms } = useInstitution()
const { gradeTone } = useAcademicFormat()
const canManage = computed(() => can('classes.manage'))

const exam = ref(null)
const groupId = ref(null)
const tab = ref(route.query.tab === 'results' ? 'results' : 'marks')
const busy = ref(false)

const sheetSubject = ref(null)
const sheet = ref(null)
const markInputs = ref([])
const savingMarks = ref(false)

const results = ref(null)
const remarks = ref({})
const savingRemarks = ref(false)
const pdfBusy = ref(false)

const published = computed(() => exam.value?.status === 'published')
const mode = computed(() => exam.value?.mode)
const group = computed(() => exam.value?.groups.find(g => g.id === groupId.value))
const canRemark = computed(() => !published.value && !!results.value?.can_write_remarks)
const tabs = [{ key: 'marks', label: 'Marks entry' }, { key: 'results', label: 'Results & report cards' }]

const isNumber = v => typeof v === 'number' && !Number.isNaN(v)
const isFail = s => sheet.value && isNumber(s.marks) && s.marks < sheet.value.subject.pass_marks
const overMax = computed(() => !!sheet.value?.students.some(s => isNumber(s.marks) && (s.marks > sheet.value.subject.full_marks || s.marks < 0)))

const counts = computed(() => (results.value?.students || []).reduce((c, r) => ({ ...c, [r.status]: (c[r.status] || 0) + 1 }), {}))
const statusTone = { passed: 'text-emerald-700', failed: 'text-red-600', incomplete: 'text-amber-600' }
const statusLabel = r => r.status === 'incomplete' ? `${r.missing} missing` : (r.status === 'passed' ? 'Passed' : 'Failed')
const subjectOf = (r, id) => r.subjects.find(s => s.subject_id === id)
const short = name => name.length > 12 ? `${name.slice(0, 10)}…` : name
const remarksChanged = computed(() => (results.value?.students || []).some(r => (remarks.value[r.student_profile_id] || '') !== (r.remarks || '')))

const loadExam = async () => {
  try {
    exam.value = (await api.get(`/term-exams/${route.params.id}`)).data
    ui.setPageTitle(exam.value.name)
    const wanted = Number(route.query.group)
    groupId.value = exam.value.groups.find(g => g.id === wanted)?.id ?? exam.value.groups[0]?.id ?? null
  } catch {
    router.replace('/term-exams')
  }
}

const loadResults = async () => {
  if (!groupId.value) return
  results.value = null
  try {
    results.value = (await api.get(`/term-exams/${exam.value.id}/groups/${groupId.value}/results`)).data
    remarks.value = Object.fromEntries(results.value.students.map(r => [r.student_profile_id, r.remarks || '']))
  } catch { results.value = { students: [], subjects: [] } }
}

const syncQuery = () => router.replace({ query: { ...route.query, tab: tab.value, group: groupId.value } })

const selectGroup = (id) => {
  groupId.value = id
  closeSheet()
  syncQuery()
  if (tab.value === 'results') loadResults()
}

const setTab = (key) => {
  tab.value = key
  syncQuery()
  if (key === 'results') loadResults()
  else loadExam()   // refresh the entry progress
}

const openSheet = async (subject) => {
  sheetSubject.value = subject
  sheet.value = null
  markInputs.value = []
  try {
    sheet.value = (await api.get(`/term-exams/${exam.value.id}/groups/${groupId.value}/marks`, { subject_id: subject.id })).data
  } catch { closeSheet() }
}
const closeSheet = () => { sheetSubject.value = null; sheet.value = null }

const saveMarks = async () => {
  savingMarks.value = true
  try {
    const res = await api.put(`/term-exams/${exam.value.id}/groups/${groupId.value}/marks`, {
      subject_id: sheetSubject.value.id,
      records: sheet.value.students.map(s => ({
        student_profile_id: s.student_profile_id,
        marks: s.is_absent || !isNumber(s.marks) ? null : s.marks,
        is_absent: !!s.is_absent,
      })),
    })
    toast.add({ title: res.message, color: 'success' })
    closeSheet()
    await loadExam()
  } catch { /* useApi already shows the error */ } finally {
    savingMarks.value = false
  }
}

const saveRemarks = async () => {
  savingRemarks.value = true
  try {
    const res = await api.put(`/term-exams/${exam.value.id}/groups/${groupId.value}/remarks`, {
      records: results.value.students.map(r => ({ student_profile_id: r.student_profile_id, remarks: remarks.value[r.student_profile_id] || null })),
    })
    toast.add({ title: res.message, color: 'success' })
    await loadResults()
  } catch { /* useApi already shows the error */ } finally {
    savingRemarks.value = false
  }
}

const setPublished = async (publish) => {
  if (publish && !confirm('Publish the results? Marks and remarks will be locked.')) return
  busy.value = true
  try {
    const res = await api.post(`/term-exams/${exam.value.id}/${publish ? 'publish' : 'unpublish'}`)
    toast.add({ title: res.message, color: 'success' })
    await loadExam()
    if (tab.value === 'results') await loadResults()
  } catch { /* useApi already shows the error */ } finally {
    busy.value = false
  }
}

// Report cards (PDF)
const cardsPath = (studentId, inline) => {
  const params = new URLSearchParams()
  if (studentId) params.set('student_profile_id', studentId)
  if (inline) params.set('inline', '1')
  return `/term-exams/${exam.value.id}/groups/${groupId.value}/report-cards?${params}`
}
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const withPdf = async (fn) => { pdfBusy.value = true; try { await fn() } finally { pdfBusy.value = false } }

const downloadAll = () => withPdf(() => pdf.download(cardsPath(), `${slug(`${exam.value.name} ${group.value.display_name}`)}.pdf`))
const printAll = () => withPdf(() => pdf.print(cardsPath(null, true)))
const downloadOne = r => withPdf(() => pdf.download(cardsPath(r.student_profile_id), `${slug(`${exam.value.name} ${r.name}`)}.pdf`))
const printOne = r => withPdf(() => pdf.print(cardsPath(r.student_profile_id, true)))

onMounted(async () => {
  await loadExam()
  if (tab.value === 'results') loadResults()
})
</script>
