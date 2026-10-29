<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50" @click.self="close">
      <form class="bg-white rounded-2xl shadow-2xl w-full max-w-lg" role="dialog" aria-modal="true" @submit.prevent="save">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">{{ exam ? 'Edit' : 'New' }} {{ isCoaching ? 'test' : 'exam' }}</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" aria-label="Close" @click="close">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block text-sm sm:col-span-2">
            <span class="block text-xs font-medium text-gray-600 mb-1">Name *</span>
            <input v-model="form.name" required maxlength="120" :placeholder="isCoaching ? 'Model Test 3' : 'Half Yearly Exam 2026'" :class="field">
          </label>
          <label class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Type *</span>
            <select v-model="form.kind" required :class="field">
              <option v-for="k in kinds" :key="k.value" :value="k.value">{{ k.label }}</option>
            </select>
          </label>
          <label v-if="!isCoaching" class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Class *</span>
            <select v-model="form.class_level_id" required :disabled="!!exam" :class="field">
              <option value="" disabled>Select class</option>
              <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
          </label>
          <label v-else class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Batch *</span>
            <select v-model="form.student_group_id" required :disabled="!!exam" :class="field">
              <option value="" disabled>Select batch</option>
              <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.display_name || b.name }}</option>
            </select>
          </label>
          <label v-if="!isCoaching" class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Academic year *</span>
            <input v-model="form.academic_year" required maxlength="20" :disabled="!!exam" :class="field">
          </label>
          <label class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Full marks</span>
            <input v-model.number="form.full_marks" type="number" min="1" max="1000" placeholder="Each subject's own" :class="field">
          </label>
          <label class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Starts</span>
            <input v-model="form.starts_on" type="date" :class="field">
          </label>
          <label class="block text-sm">
            <span class="block text-xs font-medium text-gray-600 mb-1">Ends</span>
            <input v-model="form.ends_on" type="date" :min="form.starts_on || undefined" :class="field">
          </label>
          <p class="sm:col-span-2 text-xs text-gray-500">
            Leave full marks empty to use each subject's full and pass marks. Set it for short tests (e.g. 20 or 50) — pass marks then scale to match.
          </p>
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
  exam: { type: Object, default: null },          // when editing
  levels: { type: Array, default: () => [] },
  batches: { type: Array, default: () => [] },
  defaultYear: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'saved'])

const api = useApi()
const toast = useToast()
const { isCoaching } = useInstitution()
const field = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-500'

const SCHOOL_KINDS = [
  { value: 'half_yearly', label: 'Half yearly' }, { value: 'annual', label: 'Annual' }, { value: 'pre_test', label: 'Pre-test' },
  { value: 'test', label: 'Test' }, { value: 'class_test', label: 'Class test' },
]
const COACHING_KINDS = [
  { value: 'model_test', label: 'Model test' }, { value: 'weekly_test', label: 'Weekly test' }, { value: 'monthly_test', label: 'Monthly test' },
]
const kinds = computed(() => isCoaching.value ? COACHING_KINDS : SCHOOL_KINDS)

const blank = () => ({
  name: '', kind: kinds.value[0].value, class_level_id: '', student_group_id: '',
  academic_year: props.defaultYear || String(new Date().getFullYear()), full_marks: null, starts_on: '', ends_on: '',
})
const form = reactive(blank())
const saving = ref(false)

watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  const e = props.exam
  Object.assign(form, blank(), e ? {
    name: e.name, kind: e.kind, class_level_id: e.class_level_id || '', student_group_id: e.student_group_id || '',
    academic_year: e.academic_year, full_marks: e.full_marks, starts_on: e.starts_on || '', ends_on: e.ends_on || '',
  } : {})
})

const close = () => emit('update:open', false)

const save = async () => {
  saving.value = true
  const body = { name: form.name, kind: form.kind, full_marks: form.full_marks || null, starts_on: form.starts_on || null, ends_on: form.ends_on || null }
  // Which class or batch sits the exam is fixed once created
  if (!props.exam) {
    Object.assign(body, isCoaching.value
      ? { student_group_id: form.student_group_id }
      : { class_level_id: form.class_level_id, academic_year: form.academic_year })
  }
  try {
    const res = props.exam ? await api.put(`/term-exams/${props.exam.id}`, body) : await api.post('/term-exams', body)
    toast.add({ title: res.message, color: 'success' })
    emit('saved', res.data)
    close()
  } catch { /* useApi already shows the error */ } finally {
    saving.value = false
  }
}
</script>
