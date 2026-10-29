<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Batches</h2>
        <p class="text-sm text-gray-500 mt-1">{{ batches ? `${activeCount} running · ${batches.length} in total` : 'Loading…' }}</p>
      </div>
      <button v-if="canManage" type="button" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500" @click="formOpen = true">
        <UIcon name="i-heroicons-plus" class="w-4 h-4" /> New batch
      </button>
    </div>

    <div v-if="!batches" class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <USkeleton v-for="i in 3" :key="i" class="h-40 w-full rounded-xl" />
    </div>
    <div v-else-if="!batches.length" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <UIcon name="i-heroicons-rectangle-group" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No batches yet.</p>
    </div>
    <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <NuxtLink v-for="b in batches" :key="b.id" :to="`/groups/${b.id}`" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all">
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-semibold text-gray-900">{{ b.name }}</h3>
          <span :class="['text-xs font-medium px-2 py-0.5 rounded-full shrink-0', running(b) ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500']">
            {{ running(b) ? 'Running' : 'Not running' }}
          </span>
        </div>
        <p v-if="b.schedule_note" class="text-sm text-gray-500 mt-1">{{ b.schedule_note }}</p>
        <dl class="grid grid-cols-3 gap-2 mt-4 text-center">
          <div class="rounded-lg bg-gray-50 py-2">
            <dt class="text-xs text-gray-500">Students</dt>
            <dd class="font-bold text-gray-900">{{ b.students_count }}{{ b.capacity ? `/${b.capacity}` : '' }}</dd>
          </div>
          <div class="rounded-lg bg-gray-50 py-2">
            <dt class="text-xs text-gray-500">Monthly</dt>
            <dd class="font-bold text-gray-900">{{ b.monthly_fee !== null ? `৳${b.monthly_fee.toLocaleString()}` : '—' }}</dd>
          </div>
          <div class="rounded-lg bg-gray-50 py-2">
            <dt class="text-xs text-gray-500">Teacher</dt>
            <dd class="text-xs font-medium text-gray-900 truncate px-1 pt-1">{{ b.class_teacher?.name || '—' }}</dd>
          </div>
        </dl>
        <p v-if="b.starts_on || b.ends_on" class="text-xs text-gray-400 mt-3">{{ b.starts_on || '…' }} → {{ b.ends_on || '…' }}</p>
      </NuxtLink>
    </div>

    <GroupFormModal v-model:open="formOpen" kind="batch" :teachers="teachers" @saved="load" />
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', permission: 'classes.read' })
useUiStore().setPageTitle('Batches')

const api = useApi()
const { can } = usePermission()
const canManage = computed(() => can('classes.manage'))

const batches = ref(null)
const teachers = ref([])
const formOpen = ref(false)

const today = new Date().toISOString().slice(0, 10)
const running = b => b.is_active && (!b.starts_on || b.starts_on <= today) && (!b.ends_on || b.ends_on >= today)
const activeCount = computed(() => (batches.value || []).filter(running).length)

const load = async () => {
  try { batches.value = (await api.get('/student-groups', { kind: 'batch' })).data } catch { batches.value = [] }
}

onMounted(async () => {
  await load()
  if (canManage.value) {
    try { teachers.value = (await api.get('/faculty', { per_page: 200 })).data } catch { /* optional */ }
  }
})
</script>
