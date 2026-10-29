<template>
  <div>
    <div v-if="!groups" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <USkeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-xl" />
    </div>
    <div v-else-if="!groups.length" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <UIcon name="i-heroicons-squares-2x2" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">You are not assigned to any {{ terms.groups.toLowerCase() }} yet.</p>
    </div>
    <div v-else class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="g in groups" :key="g.id" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <NuxtLink :to="`/groups/${g.id}`" class="font-semibold text-gray-900 hover:text-emerald-700">{{ g.display_name }}</NuxtLink>
            <p class="text-xs text-gray-500 mt-0.5">{{ g.students_count }} students{{ g.is_class_teacher ? ' · You are the class teacher' : '' }}</p>
          </div>
          <span v-if="g.can_take_attendance" :class="['text-xs font-medium px-2 py-0.5 rounded-full shrink-0', g.taken_today ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
            {{ g.taken_today ? 'Done today' : 'Not taken today' }}
          </span>
        </div>
        <div class="flex gap-4 mt-4 text-sm">
          <NuxtLink v-if="g.can_take_attendance" :to="`/groups/${g.id}?tab=attendance`" class="font-medium text-emerald-700 hover:underline">
            {{ g.taken_today ? 'Update attendance' : 'Take attendance' }} →
          </NuxtLink>
          <NuxtLink :to="`/groups/${g.id}?tab=report`" class="text-gray-600 hover:underline">Monthly report</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()
const { terms } = useInstitution()
const groups = ref(null)

onMounted(async () => {
  try { groups.value = (await api.get('/me/teaching-groups')).data } catch { groups.value = [] }
})
</script>
