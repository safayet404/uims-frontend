<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Emails</h2>
        <p class="text-sm text-gray-500 mt-1">
          Personal emails sent from inside the system.
          <span v-if="limit">You have sent {{ sentToday }} of {{ limit }} today.</span>
        </p>
      </div>
      <button type="button" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500"
        @click="composeOpen = true">
        <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" /> New email
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <input v-model="search" type="search" placeholder="Search recipient or subject"
          class="w-full sm:w-80 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          @input="debouncedLoad">
      </div>

      <TableSkeleton v-if="!emails" :rows="5" :cols="4" />
      <div v-else-if="!emails.length" class="p-12 text-center">
        <UIcon name="i-heroicons-envelope" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">No emails yet.</p>
      </div>
      <ul v-else class="divide-y divide-gray-100">
        <li v-for="e in emails" :key="e.id">
          <button type="button" class="w-full flex flex-wrap items-center gap-3 px-5 py-3 text-left hover:bg-gray-50" @click="open[e.id] = !open[e.id]">
            <div class="flex-1 min-w-48">
              <p class="text-sm font-medium text-gray-900 truncate">{{ e.subject }}</p>
              <p class="text-xs text-gray-500 truncate">
                To {{ e.recipient_name ? `${e.recipient_name} <${e.to}>` : e.to }}
                <span class="capitalize"> · {{ e.recipient_type }}</span>
                <span v-if="showSender"> · from {{ e.sender }}</span>
              </p>
            </div>
            <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', e.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700']">
              {{ e.status === 'sent' ? 'Sent' : 'Failed' }}
            </span>
            <span class="text-xs text-gray-400 w-32 text-right">{{ e.sent_at }}</span>
          </button>
          <p v-if="open[e.id]" class="px-5 pb-4 text-sm text-gray-700 whitespace-pre-line">{{ e.body }}</p>
        </li>
      </ul>

      <div v-if="pagination && pagination.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
        <button type="button" :disabled="page <= 1" class="text-gray-600 disabled:opacity-40" @click="page--; load()">← Newer</button>
        <span class="text-gray-500">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
        <button type="button" :disabled="page >= pagination.last_page" class="text-gray-600 disabled:opacity-40" @click="page++; load()">Older →</button>
      </div>
    </div>

    <ComposeEmailModal v-model:open="composeOpen" @sent="load" />
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', permission: 'communications.send' })
useUiStore().setPageTitle('Emails')

const api = useApi()
const { can } = usePermission()
// Only people who can read every sender's emails see who sent each one
const showSender = computed(() => can('communications.read'))

const emails = ref(null)
const pagination = ref(null)
const page = ref(1)
const search = ref('')
const open = reactive({})
const limit = ref(0)
const sentToday = ref(0)
const composeOpen = ref(false)

const load = async () => {
  emails.value = null
  try {
    const res = await api.get('/communications/email', { page: page.value, search: search.value || undefined })
    emails.value = res.data
    pagination.value = res.pagination
    limit.value = res.daily_limit
    sentToday.value = res.sent_today
  } catch {
    emails.value = []
  }
}

let timer
const debouncedLoad = () => { clearTimeout(timer); timer = setTimeout(() => { page.value = 1; load() }, 300) }

onMounted(load)
</script>
