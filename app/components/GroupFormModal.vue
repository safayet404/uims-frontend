<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50" @click.self="close">
      <form class="bg-white rounded-2xl shadow-2xl w-full max-w-lg" role="dialog" aria-modal="true" @submit.prevent="save">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">{{ group ? 'Edit' : 'New' }} {{ kind === 'batch' ? 'batch' : 'section' }}</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" aria-label="Close" @click="close">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label v-if="kind === 'section'" class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Class *</span>
            <select v-model="form.class_level_id" required :class="field">
              <option value="" disabled>Select class</option>
              <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
          </label>
          <label class="block text-sm" :class="kind === 'batch' ? 'sm:col-span-2' : ''">
            <span class="block text-xs font-medium text-gray-600 mb-1">{{ kind === 'batch' ? 'Batch name *' : 'Section *' }}</span>
            <input v-model="form.name" required maxlength="100" :placeholder="kind === 'batch' ? 'HSC 2026 Physics – Evening' : 'A'" :class="field">
          </label>
          <label v-if="kind === 'section' && selectedLevel?.has_streams" class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Group</span>
            <select v-model="form.stream" :class="field">
              <option value="">None</option>
              <option value="science">Science</option>
              <option value="arts">Arts / Humanities</option>
              <option value="commerce">Commerce / Business</option>
            </select>
          </label>
          <label class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Shift</span>
            <select v-model="form.shift" :class="field">
              <option value="">—</option>
              <option value="morning">Morning</option>
              <option value="day">Day</option>
              <option value="evening">Evening</option>
            </select>
          </label>
          <label class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Academic year *</span>
            <input v-model="form.academic_year" required maxlength="20" :class="field">
          </label>
          <label class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">{{ kind === 'batch' ? 'Lead teacher' : 'Class teacher' }}</span>
            <select v-model="form.class_teacher_id" :class="field">
              <option value="">—</option>
              <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </label>
          <label class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Seats</span>
            <input v-model.number="form.capacity" type="number" min="1" placeholder="No limit" :class="field">
          </label>
          <label class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Monthly fee (৳)</span>
            <input v-model.number="form.monthly_fee" type="number" min="0" step="50" placeholder="Not billed monthly" :class="field">
          </label>
          <template v-if="kind === 'batch'">
            <label class="block text-sm">
              <span class="block text-xs font-medium text-gray-600 mb-1">Starts</span>
              <input v-model="form.starts_on" type="date" :class="field">
            </label>
            <label class="block text-sm">
              <span class="block text-xs font-medium text-gray-600 mb-1">Ends</span>
              <input v-model="form.ends_on" type="date" :class="field">
            </label>
            <label class="block text-sm sm:col-span-2">
              <span class="block text-xs font-medium text-gray-600 mb-1">Class days and time</span>
              <input v-model="form.schedule_note" maxlength="255" placeholder="Sat, Mon, Wed · 5–7 pm" :class="field">
            </label>
          </template>
        </div>

        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" @click="close">Cancel</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  kind: { type: String, default: 'section' },     // section | batch
  group: { type: Object, default: null },         // when editing
  levels: { type: Array, default: () => [] },
  teachers: { type: Array, default: () => [] },
  defaultLevelId: { type: [Number, String], default: '' },
})
const emit = defineEmits(['update:open', 'saved'])

const api = useApi()
const toast = useToast()
const field = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900'

const blank = () => ({
  class_level_id: props.defaultLevelId || '', name: '', stream: '', shift: '', academic_year: String(new Date().getFullYear()),
  class_teacher_id: '', capacity: null, monthly_fee: null, starts_on: '', ends_on: '', schedule_note: '',
})
const form = reactive(blank())
const saving = ref(false)
const selectedLevel = computed(() => props.levels.find(l => l.id === form.class_level_id))

watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  const g = props.group
  Object.assign(form, blank(), g ? {
    class_level_id: g.class_level?.id || '', name: g.name, stream: g.stream || '', shift: g.shift || '', academic_year: g.academic_year,
    class_teacher_id: g.class_teacher?.id || '', capacity: g.capacity, monthly_fee: g.monthly_fee, starts_on: g.starts_on || '',
    ends_on: g.ends_on || '', schedule_note: g.schedule_note || '',
  } : {})
})

const close = () => emit('update:open', false)

const save = async () => {
  saving.value = true
  // Empty fields are sent as null so optional columns are cleared
  const body = Object.fromEntries(Object.entries({ ...form, kind: props.kind }).map(([k, v]) => [k, v === '' ? null : v]))
  try {
    const res = props.group ? await api.put(`/student-groups/${props.group.id}`, body) : await api.post('/student-groups', body)
    toast.add({ title: res.message, color: 'success' })
    emit('saved', res.data)
    close()
  } catch { /* useApi already shows the error */ } finally {
    saving.value = false
  }
}
</script>
