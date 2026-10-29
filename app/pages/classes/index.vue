<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Classes &amp; Sections</h2>
        <p class="text-sm text-gray-500 mt-1">Academic year
          <select v-model="year" class="ml-1 rounded border border-gray-200 px-2 py-0.5 text-sm" @change="load">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </p>
      </div>
      <button v-if="canManage" type="button" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500" @click="openCreate()">
        <UIcon name="i-heroicons-plus" class="w-4 h-4" /> New section
      </button>
    </div>

    <div v-if="!levels" class="space-y-4">
      <USkeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-xl" />
    </div>

    <section v-for="stage in stages" v-else :key="stage.key" class="space-y-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ stage.label }}</h3>
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="level in stage.levels" :key="level.id" class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-900">{{ level.name }}</h4>
            <span class="text-xs text-gray-400">{{ level.subjects_count }} subjects</span>
          </div>
          <ul v-if="sectionsOf(level.id).length" class="mt-3 space-y-2">
            <li v-for="g in sectionsOf(level.id)" :key="g.id">
              <NuxtLink :to="`/groups/${g.id}`" class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 hover:bg-emerald-50">
                <span class="text-sm font-medium text-gray-800">
                  Section {{ g.name }}<span v-if="g.stream" class="text-gray-500"> · {{ cap(g.stream) }}</span><span v-if="g.shift" class="text-gray-500"> · {{ cap(g.shift) }}</span>
                </span>
                <span class="text-xs text-gray-500">{{ g.students_count }}{{ g.capacity ? `/${g.capacity}` : '' }} students</span>
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="mt-3 text-sm text-gray-400">No sections yet.</p>
          <button v-if="canManage" type="button" class="mt-3 text-xs font-medium text-emerald-700 hover:underline" @click="openCreate(level.id)">+ Add section</button>
        </div>
      </div>
    </section>

    <GroupFormModal v-model:open="formOpen" kind="section" :levels="levels || []" :teachers="teachers" :default-level-id="defaultLevel" @saved="load" />
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', permission: 'classes.read' })
useUiStore().setPageTitle('Classes & Sections')

const api = useApi()
const { can } = usePermission()
const canManage = computed(() => can('classes.manage'))

const thisYear = new Date().getFullYear()
const years = [thisYear + 1, thisYear, thisYear - 1, thisYear - 2].map(String)
const year = ref(String(thisYear))

const levels = ref(null)
const sections = ref([])
const teachers = ref([])
const formOpen = ref(false)
const defaultLevel = ref('')

const STAGES = [
  { key: 'pre_primary', label: 'Pre-primary' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'higher_secondary', label: 'Higher secondary' },
]
const stages = computed(() => STAGES
  .map(s => ({ ...s, levels: (levels.value || []).filter(l => l.stage === s.key) }))
  .filter(s => s.levels.length))
const sectionsOf = levelId => sections.value.filter(g => g.class_level?.id === levelId)
const cap = s => s.charAt(0).toUpperCase() + s.slice(1)

const openCreate = (levelId = '') => { defaultLevel.value = levelId; formOpen.value = true }

const load = async () => {
  try {
    const [lv, gr] = await Promise.all([
      api.get('/class-levels', { academic_year: year.value }),
      api.get('/student-groups', { kind: 'section', academic_year: year.value }),
    ])
    levels.value = lv.data
    sections.value = gr.data
  } catch { levels.value = [] }
}

onMounted(async () => {
  await load()
  if (canManage.value) {
    try { teachers.value = (await api.get('/faculty', { per_page: 200 })).data } catch { /* teachers list is optional */ }
  }
})
</script>
