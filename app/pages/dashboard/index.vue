<template>
  <div class="space-y-6">

    <!-- Welcome banner -->
    <div class="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold">Good {{ timeOfDay }}, {{ firstName }} 👋</h2>
          <p class="text-primary-100 mt-1">Here's what's happening at UniCore today.</p>
        </div>
        <div class="hidden sm:block text-right">
          <p class="text-primary-200 text-sm">{{ today }}</p>
          <p class="text-white font-semibold capitalize">{{ auth.roles[0] }}</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.label" class="hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', stat.bg]">
            <UIcon :name="stat.icon" :class="['w-6 h-6', stat.color]" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent activity -->
    <div class="grid lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Recent Activity</h3>
            <NuxtLink to="/activity-logs" class="text-sm text-primary-600 hover:underline">View all</NuxtLink>
          </div>
        </template>
        <div v-if="loadingLogs" class="space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-10 w-full" />
        </div>
        <div v-else class="space-y-3">
          <div v-for="log in recentLogs" :key="log.id" class="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
            <UAvatar :src="log.user?.avatar_url" :alt="log.user?.name" size="xs" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ log.description }}</p>
              <p class="text-xs text-gray-400">{{ log.user?.name }} · {{ formatTime(log.created_at) }}</p>
            </div>
            <UBadge :label="log.action" size="xs" color="gray" variant="soft" />
          </div>
          <p v-if="!recentLogs.length" class="text-sm text-gray-400 text-center py-4">No activity yet</p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold text-gray-900">Quick Actions</h3>
        </template>
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink
            v-for="action in quickActions"
            v-if="auth.hasPermission(action.permission)"
            :key="action.label"
            :to="action.to"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all text-center group"
          >
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', action.bg]">
              <UIcon :name="action.icon" :class="['w-5 h-5', action.color]" />
            </div>
            <span class="text-xs font-medium text-gray-700 group-hover:text-primary-700">{{ action.label }}</span>
          </NuxtLink>
        </div>
      </UCard>
    </div>

  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { useAuthStore } from '~/stores/auth'
import { useUiStore }   from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const auth = useAuthStore()
const ui   = useUiStore()
const api  = useApi()

ui.setPageTitle('Dashboard')
ui.setBreadcrumbs([{ label: 'Dashboard' }])

const loadingLogs = ref(true)
const recentLogs  = ref([])
const dashStats   = ref({})

const firstName   = computed(() => auth.user?.name?.split(' ')[0])
const today       = computed(() => dayjs().format('dddd, MMMM D YYYY'))
const timeOfDay   = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

const formatTime = (date) => dayjs(date).fromNow()

const stats = computed(() => [
  { label: 'Total Users',    value: dashStats.value.total_users    || 0, icon: 'i-heroicons-users',        color: 'text-primary-600', bg: 'bg-primary-50' },
  { label: 'Students',       value: dashStats.value.total_students || 0, icon: 'i-heroicons-user-group',   color: 'text-blue-600',    bg: 'bg-blue-50' },
  { label: 'Faculty',        value: dashStats.value.total_faculty  || 0, icon: 'i-heroicons-briefcase',    color: 'text-green-600',   bg: 'bg-green-50' },
  { label: 'Today Activity', value: dashStats.value.today_activity || 0, icon: 'i-heroicons-bolt',         color: 'text-amber-600',   bg: 'bg-amber-50' },
])

const quickActions = [
  { label: 'Add Student',    to: '/students/create',    icon: 'i-heroicons-user-plus',        color: 'text-blue-600',    bg: 'bg-blue-50',    permission: 'students.create' },
  { label: 'Mark Attendance',to: '/attendance/mark',    icon: 'i-heroicons-check-circle',     color: 'text-green-600',   bg: 'bg-green-50',   permission: 'attendance.create' },
  { label: 'Enter Grades',   to: '/grades/enter',       icon: 'i-heroicons-pencil-square',    color: 'text-purple-600',  bg: 'bg-purple-50',  permission: 'grades.create' },
  { label: 'Collect Fee',    to: '/fees/collect',       icon: 'i-heroicons-banknotes',        color: 'text-amber-600',   bg: 'bg-amber-50',   permission: 'fees.collect' },
  { label: 'Issue Book',     to: '/library/issue',      icon: 'i-heroicons-book-open',        color: 'text-rose-600',    bg: 'bg-rose-50',    permission: 'library.issue' },
  { label: 'View Reports',   to: '/reports',            icon: 'i-heroicons-chart-pie',        color: 'text-indigo-600',  bg: 'bg-indigo-50',  permission: 'reports.read' },
]

onMounted(async () => {
  try {
    const [statsRes, logsRes] = await Promise.all([
      api.get('/users/stats'),
      api.get('/activity-logs', { per_page: 8 }),
    ])
    dashStats.value = statsRes.data
    recentLogs.value = logsRes.data
  } catch {}
  finally { loadingLogs.value = false }
})
</script>
