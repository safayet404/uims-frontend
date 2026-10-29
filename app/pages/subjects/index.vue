<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Subjects</h2>
        <p class="text-sm text-gray-500 mt-1">
          <select v-model="levelFilter" class="rounded border border-gray-200 px-2 py-0.5 text-sm" @change="load">
            <option value="">All classes</option>
            <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </p>
      </div>
      <button v-if="canManage" type="button" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500" @click="openForm()">
        <UIcon name="i-heroicons-plus" class="w-4 h-4" /> New subject
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <TableSkeleton v-if="!subjects" :rows="6" :cols="4" />
      <p v-else-if="!subjects.length" class="p-12 text-center text-gray-500">No subjects yet.</p>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/60">
              <th class="px-5 py-3 font-medium">Subject</th>
              <th class="px-5 py-3 font-medium">Class</th>
              <th class="px-5 py-3 font-medium">Group</th>
              <th class="px-5 py-3 font-medium text-center">Marks (pass)</th>
              <th class="px-5 py-3 font-medium text-center">4th subject</th>
              <th v-if="canManage" class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="s in subjects" :key="s.id">
              <td class="px-5 py-3">
                <p class="font-medium text-gray-900">{{ s.name }}</p>
                <p class="text-xs text-gray-400 font-mono">{{ s.code }}</p>
              </td>
              <td class="px-5 py-3 text-gray-600">{{ s.class_level?.name || 'General' }}</td>
              <td class="px-5 py-3 text-gray-600 capitalize">{{ s.stream || 'All' }}</td>
              <td class="px-5 py-3 text-center text-gray-600">{{ s.full_marks }} ({{ s.pass_marks }})</td>
              <td class="px-5 py-3 text-center">{{ s.is_optional ? 'Yes' : '—' }}</td>
              <td v-if="canManage" class="px-5 py-3 text-right whitespace-nowrap">
                <button type="button" class="text-xs text-gray-600 hover:underline mr-3" @click="openForm(s)">Edit</button>
                <button type="button" class="text-xs text-red-600 hover:underline" @click="remove(s)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="formOpen" class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50" @click.self="formOpen = false">
        <form class="bg-white rounded-2xl shadow-2xl w-full max-w-md" role="dialog" aria-modal="true" @submit.prevent="save">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ editing ? 'Edit subject' : 'New subject' }}</h3>
          </div>
          <div class="p-6 grid grid-cols-2 gap-4">
            <label class="block text-sm col-span-2">
              <span class="block text-xs font-medium text-gray-600 mb-1">Name *</span>
              <input v-model="form.name" required maxlength="100" :class="field">
            </label>
            <label class="block text-sm">
              <span class="block text-xs font-medium text-gray-600 mb-1">Code *</span>
              <input v-model="form.code" required maxlength="30" placeholder="C6-BAN" :class="field + ' font-mono'">
            </label>
            <label class="block text-sm">
              <span class="block text-xs font-medium text-gray-600 mb-1">Class</span>
              <select v-model="form.class_level_id" :class="field">
                <option :value="null">General (any)</option>
                <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.name }}</option>
              </select>
            </label>
            <label class="block text-sm">
              <span class="block text-xs font-medium text-gray-600 mb-1">Group</span>
              <select v-model="form.stream" :class="field">
                <option :value="null">All</option>
                <option value="science">Science</option>
                <option value="arts">Arts / Humanities</option>
                <option value="commerce">Commerce / Business</option>
              </select>
            </label>
            <label class="flex items-center gap-2 text-sm pt-5">
              <input v-model="form.is_optional" type="checkbox" class="rounded text-emerald-600"> Can be 4th subject
            </label>
            <label class="block text-sm">
              <span class="block text-xs font-medium text-gray-600 mb-1">Full marks *</span>
              <input v-model.number="form.full_marks" type="number" min="1" required :class="field">
            </label>
            <label class="block text-sm">
              <span class="block text-xs font-medium text-gray-600 mb-1">Pass marks *</span>
              <input v-model.number="form.pass_marks" type="number" min="0" required :class="field">
            </label>
          </div>
          <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
            <button type="button" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" @click="formOpen = false">Cancel</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50">{{ saving ? 'Saving…' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', permission: 'classes.read' })
useUiStore().setPageTitle('Subjects')

const api = useApi()
const toast = useToast()
const { can } = usePermission()
const canManage = computed(() => can('classes.manage'))
const field = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900'

const subjects = ref(null)
const levels = ref([])
const levelFilter = ref('')
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({ name: '', code: '', class_level_id: null, stream: null, full_marks: 100, pass_marks: 33, is_optional: false })

const openForm = (s = null) => {
  editing.value = s
  Object.assign(form, s
    ? { name: s.name, code: s.code, class_level_id: s.class_level?.id || null, stream: s.stream, full_marks: s.full_marks, pass_marks: s.pass_marks, is_optional: s.is_optional }
    : { name: '', code: '', class_level_id: levelFilter.value || null, stream: null, full_marks: 100, pass_marks: 33, is_optional: false })
  formOpen.value = true
}

const save = async () => {
  saving.value = true
  try {
    const res = editing.value ? await api.put(`/subjects/${editing.value.id}`, form) : await api.post('/subjects', form)
    toast.add({ title: res.message, color: 'success' })
    formOpen.value = false
    await load()
  } catch { /* useApi already shows the error */ } finally {
    saving.value = false
  }
}

const remove = async (s) => {
  if (!confirm(`Delete ${s.name}?`)) return
  try {
    await api.delete(`/subjects/${s.id}`)
    await load()
  } catch { /* useApi already shows the error */ }
}

const load = async () => {
  subjects.value = null
  try { subjects.value = (await api.get('/subjects', { class_level_id: levelFilter.value || undefined })).data } catch { subjects.value = [] }
}

onMounted(async () => {
  try { levels.value = (await api.get('/class-levels')).data } catch { /* optional */ }
  await load()
})
</script>
