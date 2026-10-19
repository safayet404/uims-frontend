<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900">Teaching Routine</h2>
      <p class="text-sm text-gray-500 mt-1">{{ termLabel }}</p>
    </div>
    <WeeklyRoutine :slots="slots" empty-text="No classes are scheduled for your courses yet." />
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['faculty'] })

useUiStore().setPageTitle('Teaching Routine')
const api = useApi()

const slots = ref(null)
const term = ref(null)
const termLabel = computed(() => term.value ? `${term.value.semester} · ${term.value.academic_year}` : 'Current semester')

onMounted(async () => {
  try {
    const res = await api.get('/me/faculty/timetable')
    slots.value = res.data
    term.value = res.term
  } catch {
    slots.value = []
  }
})
</script>
