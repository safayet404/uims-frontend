<template>
  <div class="space-y-6">
    <NuxtLink :to="backLink" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
      <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" /> {{ group?.kind === 'batch' ? 'Batches' : 'Classes & Sections' }}
    </NuxtLink>

    <USkeleton v-if="!group" class="h-16 w-96" />
    <div v-else class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900">{{ group.display_name }}</h2>
        <p class="text-sm text-gray-500 mt-1">
          {{ group.academic_year }} · {{ activeMembers.length }}{{ group.capacity ? ` of ${group.capacity}` : '' }} students
          <span v-if="group.class_teacher"> · {{ group.kind === 'batch' ? 'Teacher' : 'Class teacher' }}: {{ group.class_teacher.name }}</span>
          <span v-if="group.monthly_fee !== null"> · ৳{{ group.monthly_fee.toLocaleString() }}/month</span>
        </p>
        <p v-if="group.schedule_note" class="text-sm text-gray-500">{{ group.schedule_note }}</p>
      </div>
      <div v-if="canManage" class="flex gap-2">
        <button type="button" class="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" @click="editOpen = true">Edit</button>
        <button type="button" class="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50" @click="remove">Delete</button>
      </div>
    </div>

    <template v-if="group">
      <div class="flex gap-1 border-b border-gray-200">
        <button v-for="t in tabs" :key="t.key" type="button" @click="tab = t.key"
          :class="['px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', tab === t.key ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800']">
          {{ t.label }}
        </button>
      </div>

      <!-- Students -->
      <div v-if="tab === 'students'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
          <p class="text-sm text-gray-500">Sorted by roll number</p>
          <button v-if="canManage" type="button" class="text-sm font-medium text-emerald-700 hover:underline" @click="openAdd">+ Add students</button>
        </div>
        <p v-if="!activeMembers.length" class="p-12 text-center text-gray-500">No students yet.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/60">
                <th class="px-5 py-3 font-medium w-24">Roll</th>
                <th class="px-5 py-3 font-medium">Student</th>
                <th v-if="optionalSubjects.length" class="px-5 py-3 font-medium">4th subject</th>
                <th v-if="canManage" class="px-5 py-3" />
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="m in activeMembers" :key="m.id">
                <td class="px-5 py-2">
                  <input v-if="canManage" :value="m.roll_number" type="number" min="1" :aria-label="`Roll of ${m.name}`"
                    class="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm" @change="updateMember(m, { roll_number: Number($event.target.value) || null })">
                  <span v-else>{{ m.roll_number }}</span>
                </td>
                <td class="px-5 py-2">
                  <p class="font-medium text-gray-900">{{ m.name }}</p>
                  <p class="text-xs text-gray-400">{{ m.student_id }}</p>
                </td>
                <td v-if="optionalSubjects.length" class="px-5 py-2">
                  <select v-if="canManage" :value="m.optional_subject?.id || ''" class="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                    @change="updateMember(m, { optional_subject_id: Number($event.target.value) || null })">
                    <option value="">None</option>
                    <option v-for="s in optionalSubjects" :key="s.subject_id" :value="s.subject_id">{{ s.name }}</option>
                  </select>
                  <span v-else>{{ m.optional_subject?.name || '—' }}</span>
                </td>
                <td v-if="canManage" class="px-5 py-2 text-right">
                  <button type="button" class="text-xs text-red-600 hover:underline" @click="removeMember(m)">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Subjects -->
      <div v-if="tab === 'subjects'" class="bg-white rounded-xl border border-gray-200">
        <p v-if="!subjectRows.length" class="p-12 text-center text-gray-500">No subjects yet.</p>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="row in subjectRows" :key="row.subject_id" class="flex flex-wrap items-center gap-3 px-5 py-3">
            <div class="flex-1 min-w-40">
              <p class="text-sm font-medium text-gray-900">{{ row.name }}</p>
              <p v-if="row.is_optional" class="text-xs text-amber-700">Can be taken as 4th subject</p>
            </div>
            <select v-if="canManage" v-model="row.faculty_profile_id" class="rounded-lg border border-gray-200 px-2 py-1 text-sm" :aria-label="`Teacher for ${row.name}`">
              <option :value="null">No teacher</option>
              <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <span v-else class="text-sm text-gray-600">{{ teacherName(row.faculty_profile_id) }}</span>
            <button v-if="canManage" type="button" class="text-xs text-red-600 hover:underline" @click="subjectRows = subjectRows.filter(r => r !== row)">Remove</button>
          </li>
        </ul>
        <div v-if="canManage" class="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-gray-100">
          <select v-model="subjectToAdd" class="rounded-lg border border-gray-200 px-2 py-1.5 text-sm">
            <option value="">Add a subject…</option>
            <option v-for="s in addableSubjects" :key="s.id" :value="s.id">{{ s.name }}{{ s.class_level ? '' : ' (general)' }}</option>
          </select>
          <button type="button" :disabled="savingSubjects" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50" @click="saveSubjects">
            {{ savingSubjects ? 'Saving…' : 'Save subjects' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Add students -->
    <Teleport to="body">
      <div v-if="addOpen" class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50" @click.self="addOpen = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg" role="dialog" aria-modal="true">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Add students</h3>
            <p class="text-xs text-gray-500 mt-1">They get the next roll numbers; you can change them afterwards.</p>
          </div>
          <div class="p-6 space-y-3">
            <input v-model="studentSearch" type="search" placeholder="Search by name or ID" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" @input="searchStudents">
            <ul class="max-h-72 overflow-y-auto divide-y divide-gray-100 rounded-lg border border-gray-100">
              <li v-for="s in candidates" :key="s.id">
                <label class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input v-model="selected" type="checkbox" :value="s.id" class="rounded text-emerald-600">
                  <span class="flex-1 min-w-0">
                    <span class="block text-sm text-gray-900 truncate">{{ s.name }}</span>
                    <span class="block text-xs text-gray-400">{{ s.student_id }}</span>
                  </span>
                </label>
              </li>
              <li v-if="!candidates.length" class="px-3 py-6 text-center text-sm text-gray-400">{{ studentSearch.length < 2 ? 'Type at least 2 letters' : 'No matching students' }}</li>
            </ul>
          </div>
          <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
            <button type="button" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" @click="addOpen = false">Cancel</button>
            <button type="button" :disabled="!selected.length || adding" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50" @click="addStudents">
              {{ adding ? 'Adding…' : `Add ${selected.length || ''}` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <GroupFormModal v-if="group" v-model:open="editOpen" :kind="group.kind" :group="group" :levels="levels" :teachers="teachers" @saved="load" />
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', permission: 'classes.read' })

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const api = useApi()
const toast = useToast()
const { can } = usePermission()
const canManage = computed(() => can('classes.manage'))

const group = ref(null)
const tab = ref('students')
const tabs = [{ key: 'students', label: 'Students' }, { key: 'subjects', label: 'Subjects & teachers' }]
const teachers = ref([])
const levels = ref([])
const editOpen = ref(false)

const backLink = computed(() => group.value?.kind === 'batch' ? '/batches' : '/classes')
const activeMembers = computed(() => (group.value?.members || []).filter(m => m.status === 'active'))
const optionalSubjects = computed(() => (group.value?.subjects || []).filter(s => s.is_optional))
const teacherName = id => teachers.value.find(t => t.id === id)?.name || '—'

// ── Subjects ────────────────────────────────────────────────
const subjectRows = ref([])
const allSubjects = ref([])
const subjectToAdd = ref('')
const savingSubjects = ref(false)
const addableSubjects = computed(() => allSubjects.value.filter(s => !subjectRows.value.some(r => r.subject_id === s.id)))

watch(subjectToAdd, (id) => {
  if (!id) return
  const s = allSubjects.value.find(x => x.id === id)
  subjectRows.value.push({ subject_id: s.id, name: s.name, is_optional: s.is_optional, faculty_profile_id: null })
  subjectToAdd.value = ''
})

const saveSubjects = async () => {
  savingSubjects.value = true
  try {
    await api.put(`/student-groups/${group.value.id}/subjects`, {
      subjects: subjectRows.value.map(r => ({ subject_id: r.subject_id, faculty_profile_id: r.faculty_profile_id })),
    })
    toast.add({ title: 'Subjects saved', color: 'success' })
    await load()
  } catch { /* useApi already shows the error */ } finally {
    savingSubjects.value = false
  }
}

// ── Members ─────────────────────────────────────────────────
const updateMember = async (m, changes) => {
  try {
    await api.patch(`/student-groups/${group.value.id}/members/${m.id}`, changes)
    toast.add({ title: 'Saved', color: 'success' })
  } catch { /* useApi already shows the error */ }
  await load()
}

const removeMember = async (m) => {
  if (!confirm(`Remove ${m.name} from ${group.value.display_name}?`)) return
  try {
    await api.delete(`/student-groups/${group.value.id}/members/${m.id}`)
    await load()
  } catch { /* useApi already shows the error */ }
}

const addOpen = ref(false)
const studentSearch = ref('')
const candidates = ref([])
const selected = ref([])
const adding = ref(false)
const openAdd = () => { studentSearch.value = ''; candidates.value = []; selected.value = []; addOpen.value = true }

let timer
const searchStudents = () => {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (studentSearch.value.trim().length < 2) { candidates.value = []; return }
    try {
      const inGroup = new Set(activeMembers.value.map(m => m.student_profile_id))
      candidates.value = ((await api.get('/students', { search: studentSearch.value.trim(), per_page: 20 })).data || []).filter(s => !inGroup.has(s.id))
    } catch { candidates.value = [] }
  }, 300)
}

const addStudents = async () => {
  adding.value = true
  try {
    const res = await api.post(`/student-groups/${group.value.id}/members`, { student_profile_ids: selected.value })
    toast.add({ title: res.message, color: 'success' })
    addOpen.value = false
    await load()
  } catch { /* useApi already shows the error */ } finally {
    adding.value = false
  }
}

const remove = async () => {
  if (!confirm(`Delete ${group.value.display_name}?`)) return
  try {
    await api.delete(`/student-groups/${group.value.id}`)
    router.push(backLink.value)
  } catch { /* useApi already shows the error */ }
}

// ── Loading ─────────────────────────────────────────────────
const load = async () => {
  try {
    group.value = (await api.get(`/student-groups/${route.params.id}`)).data
    ui.setPageTitle(group.value.display_name)
    subjectRows.value = group.value.subjects.map(s => ({ subject_id: s.subject_id, name: s.name, is_optional: s.is_optional, faculty_profile_id: s.teacher?.id || null }))
  } catch { /* useApi already shows the error */ }
}

onMounted(async () => {
  await load()
  if (!group.value) return
  const subjectFilter = group.value.kind === 'section' ? { class_level_id: group.value.class_level?.id, stream: group.value.stream || undefined } : {}
  const requests = [api.get('/subjects', subjectFilter).then((r) => { allSubjects.value = r.data })]
  if (canManage.value) {
    requests.push(api.get('/faculty', { per_page: 200 }).then((r) => { teachers.value = r.data }))
    requests.push(api.get('/class-levels').then((r) => { levels.value = r.data }))
  }
  await Promise.allSettled(requests)
})
</script>
