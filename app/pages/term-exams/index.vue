<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
        <p class="text-sm text-gray-500 mt-1">
          <template v-if="!isCoaching">Academic year
            <select v-model="year" class="ml-1 rounded border border-gray-200 px-2 py-0.5 text-sm" @change="load">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </template>
          <template v-else>Model tests and their merit lists</template>
        </p>
      </div>
      <button v-if="canManage" type="button" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500" @click="openForm()">
        <UIcon name="i-heroicons-plus" class="w-4 h-4" /> New {{ isCoaching ? 'test' : 'exam' }}
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <TableSkeleton v-if="!exams" :rows="4" :cols="5" />
      <div v-else-if="!exams.length" class="p-12 text-center">
        <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-gray-300 mx-auto" />
        <p class="mt-2 text-gray-500">No {{ isCoaching ? 'tests' : 'exams' }} yet.</p>
        <p v-if="canManage" class="text-sm text-gray-400">Create one, then teachers can enter marks for their subjects.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/60">
              <th class="px-5 py-3 font-medium">Name</th>
              <th class="px-5 py-3 font-medium">{{ isCoaching ? 'Batch' : 'Class' }}</th>
              <th class="px-5 py-3 font-medium">Dates</th>
              <th class="px-5 py-3 font-medium">Status</th>
              <th v-if="canManage" class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="e in exams" :key="e.id" class="hover:bg-gray-50/60">
              <td class="px-5 py-3">
                <NuxtLink :to="`/term-exams/${e.id}`" class="font-medium text-gray-900 hover:text-emerald-700">{{ e.name }}</NuxtLink>
                <p class="text-xs text-gray-400">{{ kindLabel(e.kind) }}{{ e.full_marks ? ` · out of ${e.full_marks}` : '' }}</p>
              </td>
              <td class="px-5 py-3 text-gray-700">{{ e.sits }}</td>
              <td class="px-5 py-3 text-gray-500">{{ dateRange(e) }}</td>
              <td class="px-5 py-3">
                <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium', e.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
                  {{ e.status === 'published' ? 'Published' : 'Draft' }}
                </span>
              </td>
              <td v-if="canManage" class="px-5 py-3 text-right whitespace-nowrap">
                <template v-if="e.status !== 'published'">
                  <button type="button" class="text-xs font-medium text-gray-600 hover:underline mr-3" @click="openForm(e)">Edit</button>
                  <button type="button" class="text-xs font-medium text-red-600 hover:underline" @click="remove(e)">Delete</button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ExamFormModal v-model:open="formOpen" :exam="editing" :levels="levels" :batches="batches" :default-year="year" @saved="onSaved" />
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', permission: 'grades.read' })

const api = useApi()
const toast = useToast()
const router = useRouter()
const { can } = usePermission()
const { isCoaching } = useInstitution()
const canManage = computed(() => can('classes.manage'))
const title = computed(() => isCoaching.value ? 'Tests & Results' : 'Exams & Results')
useUiStore().setPageTitle(title.value)

const thisYear = new Date().getFullYear()
const years = [thisYear + 1, thisYear, thisYear - 1, thisYear - 2].map(String)
const year = ref(String(thisYear))

const exams = ref(null)
const levels = ref([])
const batches = ref([])
const formOpen = ref(false)
const editing = ref(null)

const KINDS = {
  half_yearly: 'Half yearly', annual: 'Annual', pre_test: 'Pre-test', test: 'Test', class_test: 'Class test',
  model_test: 'Model test', weekly_test: 'Weekly test', monthly_test: 'Monthly test',
}
const kindLabel = k => KINDS[k] || k
const fmt = d => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const dateRange = e => !e.starts_on ? '—' : (e.ends_on && e.ends_on !== e.starts_on ? `${fmt(e.starts_on)} – ${fmt(e.ends_on)}` : fmt(e.starts_on))

const load = async () => {
  exams.value = null
  try {
    exams.value = (await api.get('/term-exams', isCoaching.value ? {} : { academic_year: year.value })).data
  } catch { exams.value = [] }
}

const openForm = (exam = null) => { editing.value = exam; formOpen.value = true }
const onSaved = (exam) => {
  if (editing.value) return load()
  router.push(`/term-exams/${exam.id}`)
}

const remove = async (e) => {
  if (!confirm(`Delete ${e.name}? Any marks entered for it are deleted too.`)) return
  try {
    const res = await api.delete(`/term-exams/${e.id}`)
    toast.add({ title: res.message, color: 'success' })
    load()
  } catch { /* useApi already shows the error */ }
}

onMounted(async () => {
  await load()
  if (!canManage.value) return
  try {
    if (isCoaching.value) batches.value = (await api.get('/student-groups', { kind: 'batch' })).data
    else levels.value = (await api.get('/class-levels')).data
  } catch { /* the form shows an empty list */ }
})
</script>
