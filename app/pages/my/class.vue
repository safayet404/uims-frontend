<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900">My {{ isCoaching ? 'Batches' : 'Class' }}</h2>
      <p class="text-sm text-gray-500 mt-1">Your {{ terms.group.toLowerCase() }}, teachers and subjects</p>
    </div>

    <div v-if="!groups" class="space-y-4">
      <USkeleton v-for="i in 2" :key="i" class="h-40 w-full rounded-xl" />
    </div>
    <p v-else-if="!groups.length" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
      You are not in a {{ terms.group.toLowerCase() }} yet. Please contact the office.
    </p>

    <div v-for="g in groups || []" :key="g.id" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="p-5 border-b border-gray-100">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-lg font-semibold text-gray-900">{{ g.display_name }}</h3>
          <span class="text-sm text-gray-400">{{ g.academic_year }}</span>
        </div>
        <dl class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><dt class="text-gray-500">Roll</dt><dd class="font-medium text-gray-900">{{ g.roll_number ?? '—' }}</dd></div>
          <div><dt class="text-gray-500">{{ g.kind === 'batch' ? 'Teacher' : 'Class teacher' }}</dt><dd class="font-medium text-gray-900">{{ g.class_teacher || '—' }}</dd></div>
          <div v-if="g.monthly_fee !== null"><dt class="text-gray-500">Monthly fee</dt><dd class="font-medium text-gray-900">{{ money(g.monthly_fee) }}</dd></div>
          <div v-if="g.schedule_note"><dt class="text-gray-500">Class time</dt><dd class="font-medium text-gray-900">{{ g.schedule_note }}</dd></div>
        </dl>
      </div>
      <p v-if="!g.subjects.length" class="p-8 text-center text-sm text-gray-500">No subjects yet.</p>
      <ul v-else class="divide-y divide-gray-100">
        <li v-for="s in g.subjects" :key="s.code" class="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ s.name }}</p>
            <p v-if="s.is_fourth" class="text-xs text-amber-700">4th subject</p>
          </div>
          <p class="text-sm text-gray-600">{{ s.teacher || 'Teacher not assigned' }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['student'] })

const api = useApi()
const { isCoaching, terms } = useInstitution()
const { money } = useAcademicFormat()
useUiStore().setPageTitle(isCoaching.value ? 'My Batches' : 'My Class')

const groups = ref(null)

onMounted(async () => {
  try { groups.value = (await api.get('/me/student/class')).data } catch { groups.value = [] }
})
</script>
