<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Activity Logs</h2>
                <p class="text-sm text-gray-500 mt-0.5">Track every action performed in the system</p>
            </div>
            <div class="flex items-center gap-2">
                <!-- Auto refresh toggle -->
                <label class="flex items-center gap-2 cursor-pointer">
                    <div @click="toggleAutoRefresh"
                        :class="['relative w-9 h-5 rounded-full transition-colors', autoRefresh ? 'bg-indigo-600' : 'bg-gray-300']">
                        <div
                            :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', autoRefresh ? 'translate-x-4' : 'translate-x-0.5']" />
                    </div>
                    <span class="text-xs text-gray-600">Live</span>
                </label>
                <button @click="fetchLogs" class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="Refresh">
                    <UIcon name="i-heroicons-arrow-path" :class="['w-4 h-4', loading ? 'animate-spin' : '']" />
                </button>
            </div>
        </div>

        <!-- Stats cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 mb-1">Today's Activity</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.total_today || 0 }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ stats.unique_users_today || 0 }} unique users</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 mb-1">This Week</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.total_week || 0 }}</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 mb-1">Total Logs</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.total_all || 0 }}</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 mb-2">Top Module Today</p>
                <div class="space-y-1">
                    <div v-for="m in (stats.top_modules || []).slice(0, 3)" :key="m.module"
                        class="flex items-center justify-between">
                        <span class="text-xs font-medium text-gray-700 capitalize">{{ m.module }}</span>
                        <span class="text-xs text-gray-400">{{ m.count }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div class="relative lg:col-span-1">
                    <UIcon name="i-heroicons-magnifying-glass"
                        class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input v-model="filters.search" @input="debouncedFetch" placeholder="Search description..."
                        type="search" autocomplete="new-password"
                        class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                </div>
                <select v-model="filters.module" @change="fetchLogs"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Modules</option>
                    <option v-for="m in modules" :key="m" :value="m" class="capitalize">{{ m }}</option>
                </select>
                <select v-model="filters.action" @change="fetchLogs"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Actions</option>
                    <option value="visited">visited</option>
                    <option value="created">created</option>
                    <option value="updated">updated</option>
                    <option value="deleted">deleted</option>
                    <option value="login">login</option>
                    <option value="logout">logout</option>
                    <option value="exported">exported</option>
                </select>
                <input v-model="filters.date_from" @change="fetchLogs" type="date"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700" />
                <input v-model="filters.date_to" @change="fetchLogs" type="date"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700" />
            </div>
            <div class="flex items-center justify-between mt-3">
                <div class="relative">
                    <UIcon name="i-heroicons-wifi"
                        class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input v-model="filters.ip" @input="debouncedFetch" placeholder="Filter by IP..." type="search"
                        autocomplete="new-password"
                        class="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-44" />
                </div>
                <button v-if="hasFilters" @click="clearFilters" class="text-sm text-gray-500 hover:text-gray-700">Clear
                    filters</button>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <div v-else-if="!logs.length" class="p-12 text-center">
                <UIcon name="i-heroicons-clipboard-document-list" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">No activity logs found</p>
            </div>
            <div v-else>
                <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                User</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                Module</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Action</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                Description</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                IP</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                Browser</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Time</th>
                            <th
                                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Detail</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-2">
                                    <div
                                        class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                        <span class="text-xs font-bold text-indigo-700">{{ (log.user?.name ||
                                            'S')[0].toUpperCase() }}</span>
                                    </div>
                                    <div class="min-w-0 hidden sm:block">
                                        <p class="text-xs font-medium text-gray-900 truncate max-w-24">{{ log.user?.name
                                            || 'System' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3 hidden sm:table-cell">
                                <span
                                    class="inline-flex px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full capitalize">{{
                                        log.module }}</span>
                            </td>
                            <td class="px-4 py-3">
                                <span
                                    :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', actionColor(log.action)]">{{
                                        log.action }}</span>
                            </td>
                            <td class="px-4 py-3 hidden lg:table-cell">
                                <p class="text-xs text-gray-600 truncate max-w-xs">{{ log.description }}</p>
                            </td>
                            <td class="px-4 py-3 hidden md:table-cell">
                                <span class="text-xs font-mono text-gray-500">{{ log.ip_address }}</span>
                            </td>
                            <td class="px-4 py-3 hidden md:table-cell">
                                <span class="text-xs text-gray-500">{{ log.browser || '—' }}</span>
                            </td>
                            <td class="px-4 py-3">
                                <span class="text-xs text-gray-400 whitespace-nowrap">{{ formatDate(log.created_at)
                                    }}</span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <button @click="viewDetail(log)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Pagination -->
                <div v-if="pagination.last_page > 1"
                    class="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                    <p class="text-sm text-gray-500">
                        Showing {{ (pagination.current_page - 1) * 20 + 1 }}–{{ Math.min(pagination.current_page * 20,
                            pagination.total) }} of {{ pagination.total }}
                    </p>
                    <div class="flex gap-1">
                        <button @click="changePage(pagination.current_page - 1)"
                            :disabled="pagination.current_page === 1"
                            class="px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40">‹</button>
                        <button v-for="p in pageNumbers" :key="p" @click="changePage(p)"
                            :class="['px-3 py-1 text-sm rounded', p === pagination.current_page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100']">{{
                                p }}</button>
                        <button @click="changePage(pagination.current_page + 1)"
                            :disabled="pagination.current_page === pagination.last_page"
                            class="px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40">›</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── DETAIL MODAL ── -->
        <Teleport to="body">
            <div v-if="showDetailModal && activeLog"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Log Detail</h3>
                        <button @click="showDetailModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">

                        <!-- User info -->
                        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span class="text-sm font-bold text-indigo-700">{{ (activeLog.user?.name ||
                                    'S')[0].toUpperCase() }}</span>
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-gray-900">{{ activeLog.user?.name || 'System' }}
                                </p>
                                <p class="text-xs text-gray-400">{{ activeLog.user?.email }}</p>
                            </div>
                            <div class="ml-auto text-right">
                                <span
                                    :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', actionColor(activeLog.action)]">{{
                                        activeLog.action }}</span>
                            </div>
                        </div>

                        <!-- Details grid -->
                        <div class="grid grid-cols-2 gap-3">
                            <div v-for="f in detailFields" :key="f.label" class="bg-gray-50 rounded-lg p-3">
                                <p class="text-xs text-gray-400 mb-0.5">{{ f.label }}</p>
                                <p class="text-sm font-medium text-gray-900 break-all">{{ f.value || '—' }}</p>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-xs text-gray-400 mb-0.5">Description</p>
                            <p class="text-sm text-gray-900">{{ activeLog.description }}</p>
                        </div>

                        <!-- Old/New values -->
                        <div v-if="activeLog.old_values || activeLog.new_values" class="space-y-2">
                            <div v-if="activeLog.old_values" class="bg-red-50 rounded-lg p-3">
                                <p class="text-xs font-medium text-red-600 mb-2">Before</p>
                                <pre
                                    class="text-xs text-red-700 overflow-x-auto whitespace-pre-wrap">{{ JSON.stringify(activeLog.old_values, null, 2) }}</pre>
                            </div>
                            <div v-if="activeLog.new_values" class="bg-green-50 rounded-lg p-3">
                                <p class="text-xs font-medium text-green-600 mb-2">After</p>
                                <pre
                                    class="text-xs text-green-700 overflow-x-auto whitespace-pre-wrap">{{ JSON.stringify(activeLog.new_values, null, 2) }}</pre>
                            </div>
                        </div>

                        <!-- URL -->
                        <div v-if="activeLog.url" class="bg-gray-50 rounded-lg p-3">
                            <p class="text-xs text-gray-400 mb-0.5">URL</p>
                            <p class="text-xs font-mono text-gray-700 break-all">
                                <span
                                    :class="['inline-flex px-1.5 py-0.5 text-xs font-bold rounded mr-1', methodColor(activeLog.method)]">{{
                                        activeLog.method }}</span>
                                {{ activeLog.url }}
                            </p>
                        </div>

                    </div>
                    <div class="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                        <button @click="filterByUser(activeLog)" class="text-sm text-indigo-600 hover:underline">
                            View all logs for this user →
                        </button>
                        <button @click="showDetailModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useUiStore } from '~/stores/ui'

dayjs.extend(relativeTime)

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const ui = useUiStore()
const api = useApi()

ui.setPageTitle('Activity Logs')

const logs = ref([])
const stats = ref({})
const modules = ref([])
const loading = ref(false)
const autoRefresh = ref(false)
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })

const showDetailModal = ref(false)
const activeLog = ref(null)

let refreshTimer = null

const filters = reactive({
    search: '', module: '', action: '',
    date_from: '', date_to: '', ip: '', page: 1,
})

const hasFilters = computed(() =>
    filters.search || filters.module || filters.action ||
    filters.date_from || filters.date_to || filters.ip
)

const pageNumbers = computed(() => {
    const pages = []
    for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) pages.push(i)
    return pages
})

const detailFields = computed(() => !activeLog.value ? [] : [
    { label: 'Module', value: activeLog.value.module },
    { label: 'Section', value: activeLog.value.section },
    { label: 'IP Address', value: activeLog.value.ip_address },
    { label: 'Browser', value: activeLog.value.browser },
    { label: 'Device', value: activeLog.value.device },
    { label: 'Time', value: formatDate(activeLog.value.created_at) },
])

const formatDate = (d) => dayjs(d).format('MMM D, YYYY HH:mm:ss')

const actionColor = (a) => ({
    visited: 'text-blue-700 bg-blue-50',
    created: 'text-green-700 bg-green-50',
    updated: 'text-amber-700 bg-amber-50',
    deleted: 'text-red-700 bg-red-50',
    login: 'text-indigo-700 bg-indigo-50',
    logout: 'text-gray-600 bg-gray-100',
    exported: 'text-purple-700 bg-purple-50',
    sync: 'text-teal-700 bg-teal-50',
}[a] || 'text-gray-600 bg-gray-100')

const methodColor = (m) => ({
    GET: 'text-blue-700 bg-blue-100',
    POST: 'text-green-700 bg-green-100',
    PUT: 'text-amber-700 bg-amber-100',
    PATCH: 'text-orange-700 bg-orange-100',
    DELETE: 'text-red-700 bg-red-100',
}[m] || 'text-gray-700 bg-gray-100')

let searchTimer = null
const debouncedFetch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchLogs, 400) }

const fetchLogs = async () => {
    loading.value = true
    try {
        const res = await api.get('/activity-logs', {
            search: filters.search || undefined,
            module: filters.module || undefined,
            action: filters.action || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
            ip: filters.ip || undefined,
            page: filters.page,
            per_page: 20,
        })
        logs.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => {
    try { const res = await api.get('/activity-logs/stats'); stats.value = res.data || {} } catch { }
}

const fetchModules = async () => {
    try { const res = await api.get('/activity-logs/modules'); modules.value = res.data || [] } catch { }
}

const changePage = (p) => { filters.page = p; fetchLogs() }

const clearFilters = () => {
    Object.assign(filters, { search: '', module: '', action: '', date_from: '', date_to: '', ip: '', page: 1 })
    fetchLogs()
}

const viewDetail = (log) => { activeLog.value = log; showDetailModal.value = true }

const filterByUser = (log) => {
    showDetailModal.value = false
    // Navigate to user activity if needed
}

const toggleAutoRefresh = () => {
    autoRefresh.value = !autoRefresh.value
    if (autoRefresh.value) {
        refreshTimer = setInterval(() => { fetchLogs(); fetchStats() }, 10000)
    } else {
        clearInterval(refreshTimer)
    }
}

onMounted(async () => {
    await Promise.all([fetchLogs(), fetchStats(), fetchModules()])
})

onUnmounted(() => { clearInterval(refreshTimer) })
</script>