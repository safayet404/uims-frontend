<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900">Class Routine</h2>
      <p class="text-sm text-gray-500 mt-1">{{ termLabel }}</p>
    </div>

    <div v-if="!slots" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <USkeleton v-for="i in 3" :key="i" class="h-48 w-full rounded-xl" />
    </div>

    <div v-else-if="!slots.length" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <UIcon name="i-heroicons-calendar-days" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No classes are scheduled for your courses yet.</p>
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="day in days" :key="day.name"
        :class="['bg-white rounded-xl border p-4', day.name === today ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-gray-200']">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-gray-900">{{ day.name }}</h3>
          <span v-if="day.name === today" class="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Today</span>
        </div>
        <ul class="space-y-2">
          <li v-for="s in day.slots" :key="s.course.code + s.start_time" class="rounded-lg bg-gray-50 px-3 py-2.5">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-semibold text-gray-900">{{ s.course.code }}</p>
              <p class="text-xs font-medium text-gray-500">{{ s.start_time }}–{{ s.end_time }}</p>
            </div>
            <p class="text-xs text-gray-600 truncate">{{ s.course.name }}</p>
            <p class="text-xs text-gray-400 mt-1 truncate">
              <UIcon name="i-heroicons-map-pin" class="w-3 h-3 inline -mt-0.5" /> {{ [s.room, s.building].filter(Boolean).join(', ') || 'Room TBA' }}
              <span v-if="s.faculty"> · {{ s.faculty }}</span>
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['student'] })

useUiStore().setPageTitle('Class Routine')
const api = useApi()

const ORDER = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

const slots = ref(null)
const term = ref(null)
const termLabel = computed(() => term.value ? `${term.value.semester} · ${term.value.academic_year}` : 'Current semester')

const days = computed(() => ORDER
  .map(name => ({ name, slots: (slots.value || []).filter(s => s.day === name) }))
  .filter(d => d.slots.length))

onMounted(async () => {
  try {
    const res = await api.get('/me/student/timetable')
    slots.value = res.data
    term.value = res.term
  } catch {
    slots.value = []
  }
})
</script>
