<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Notifications</h2>
                <p class="text-sm text-gray-500 mt-0.5">Stay up to date with your activity</p>
            </div>
            <div class="flex gap-2">
                <button v-if="stats.unread > 0" @click="markAllRead"
                    class="px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                    Mark all read
                </button>
                <button @click="clearRead"
                    class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Clear read
                </button>
                <button v-if="isAdmin" @click="showSendModal = true"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" /> Send Notification
                </button>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.total || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Total</p>
            </div>
            <div class="bg-red-50 rounded-xl border border-red-200 p-4">
                <p class="text-2xl font-bold text-red-600">{{ stats.unread || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Unread</p>
            </div>
            <div class="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
                <p class="text-2xl font-bold text-indigo-600">{{ stats.today || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Today</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-gray-900">{{ (stats.by_category || []).length }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Categories</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex flex-wrap gap-3">
                <select v-model="filters.category" @change="fetchNotifications"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Categories</option>
                    <option value="admission">Admission</option>
                    <option value="enrollment">Enrollment</option>
                    <option value="fee">Fee</option>
                    <option value="exam">Exam</option>
                    <option value="grade">Grade</option>
                    <option value="attendance">Attendance</option>
                    <option value="library">Library</option>
                    <option value="general">General</option>
                    <option value="system">System</option>
                </select>
                <select v-model="filters.type" @change="fetchNotifications"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Types</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="announcement">Announcement</option>
                </select>
                <select v-model="filters.is_read" @change="fetchNotifications"
                    class="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All</option>
                    <option value="false">Unread</option>
                    <option value="true">Read</option>
                </select>
                <button v-if="filters.category || filters.type || filters.is_read" @click="clearFilters"
                    class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</button>
            </div>
        </div>

        <!-- Notifications list -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <div v-else-if="!notifications.length" class="p-12 text-center">
                <UIcon name="i-heroicons-bell-slash" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">No notifications found</p>
            </div>
            <div v-else class="divide-y divide-gray-50">
                <div v-for="n in notifications" :key="n.id"
                    :class="['flex gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group', !n.is_read ? 'bg-indigo-50/30' : '']">
                    <!-- Icon -->
                    <div
                        :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5', iconBg(n.type)]">
                        <UIcon :name="iconName(n.type)" class="w-5 h-5" :class="iconColor(n.type)" />
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <p
                                        :class="['text-sm', !n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700']">
                                        {{ n.title }}</p>
                                    <span
                                        :class="['inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full capitalize', typeBadge(n.type)]">{{
                                            n.type }}</span>
                                    <span
                                        class="inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-500 capitalize">{{
                                            n.category }}</span>
                                </div>
                                <p class="text-sm text-gray-500 mt-1">{{ n.message }}</p>
                                <div class="flex items-center gap-3 mt-2">
                                    <p class="text-xs text-gray-400">{{ n.time_ago }}</p>
                                    <span v-if="n.sender" class="text-xs text-gray-400">by {{ n.sender.name }}</span>
                                    <NuxtLink v-if="n.action_url" :to="n.action_url" @click="markRead(n)"
                                        class="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                        {{ n.action_label || 'View →' }}
                                    </NuxtLink>
                                </div>
                            </div>
                            <!-- Actions -->
                            <div
                                class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button v-if="!n.is_read" @click="markRead(n)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    title="Mark read">
                                    <UIcon name="i-heroicons-check" class="w-3.5 h-3.5" />
                                </button>
                                <button @click="deleteNotification(n)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Delete">
                                    <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <!-- Unread dot -->
                            <div v-if="!n.is_read" class="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-2"></div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Pagination -->
            <div v-if="pagination.last_page > 1"
                class="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                <p class="text-sm text-gray-500">{{ pagination.total }} total</p>
                <div class="flex gap-1">
                    <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1"
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

        <!-- ── SEND NOTIFICATION MODAL ── -->
        <Teleport to="body">
            <div v-if="showSendModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Send Notification</h3>
                        <button @click="showSendModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <input type="text" style="display:none" autocomplete="username" />
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                            <input v-model="sendForm.title" autocomplete="new-password"
                                placeholder="Notification title..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Message *</label>
                            <textarea v-model="sendForm.message" rows="3" autocomplete="new-password"
                                placeholder="Write your message..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 resize-none"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                                <select v-model="sendForm.type"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                    <option value="announcement">Announcement</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                                <select v-model="sendForm.category"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="general">General</option>
                                    <option value="admission">Admission</option>
                                    <option value="enrollment">Enrollment</option>
                                    <option value="fee">Fee</option>
                                    <option value="exam">Exam</option>
                                    <option value="grade">Grade</option>
                                    <option value="attendance">Attendance</option>
                                    <option value="system">System</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Send To *</label>
                                <select v-model="sendForm.target"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="all">All Users</option>
                                    <option value="role">By Role</option>
                                </select>
                            </div>
                            <div v-if="sendForm.target === 'role'">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Role *</label>
                                <select v-model="sendForm.role"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="student">Students</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Admins</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Action URL</label>
                                <input v-model="sendForm.action_url" autocomplete="new-password" placeholder="/fees"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Action Label</label>
                                <input v-model="sendForm.action_label" autocomplete="new-password"
                                    placeholder="View Now"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showSendModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSend" :disabled="sending"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ sending ? 'Sending...' : 'Send' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const ui = useUiStore()
const auth = useAuthStore()
const api = useApi()
const toast = useToast()

ui.setPageTitle('Notifications')

const notifications = ref([])
const stats = ref({})
const loading = ref(false)
const sending = ref(false)
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })
const showSendModal = ref(false)

const isAdmin = computed(() => auth.hasRole('super-admin') || auth.hasRole('admin'))

const filters = reactive({ category: '', type: '', is_read: '', page: 1 })
const sendForm = reactive({ title: '', message: '', type: 'announcement', category: 'general', target: 'all', role: 'student', action_url: '', action_label: '' })

const pageNumbers = computed(() => { const p = []; for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) p.push(i); return p })

const iconName = (t) => ({ info: 'i-heroicons-information-circle', success: 'i-heroicons-check-circle', warning: 'i-heroicons-exclamation-triangle', error: 'i-heroicons-x-circle', announcement: 'i-heroicons-megaphone' }[t] || 'i-heroicons-bell')
const iconBg = (t) => ({ info: 'bg-blue-100', success: 'bg-green-100', warning: 'bg-yellow-100', error: 'bg-red-100', announcement: 'bg-purple-100' }[t] || 'bg-gray-100')
const iconColor = (t) => ({ info: 'text-blue-600', success: 'text-green-600', warning: 'text-yellow-600', error: 'text-red-600', announcement: 'text-purple-600' }[t] || 'text-gray-600')
const typeBadge = (t) => ({ info: 'bg-blue-50 text-blue-700', success: 'bg-green-50 text-green-700', warning: 'bg-yellow-50 text-yellow-700', error: 'bg-red-50 text-red-700', announcement: 'bg-purple-50 text-purple-700' }[t] || 'bg-gray-100 text-gray-600')

const fetchNotifications = async () => {
    loading.value = true
    try {
        const res = await api.get('/notifications', {
            category: filters.category || undefined,
            type: filters.type || undefined,
            is_read: filters.is_read !== '' ? filters.is_read : undefined,
            page: filters.page,
        })
        notifications.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => { try { const r = await api.get('/notifications/stats'); stats.value = r.data || {} } catch { } }

const changePage = (p) => { filters.page = p; fetchNotifications() }
const clearFilters = () => { Object.assign(filters, { category: '', type: '', is_read: '', page: 1 }); fetchNotifications() }

const markRead = async (n) => {
    if (n.is_read) return
    try {
        await api.patch(`/notifications/${n.id}/read`)
        n.is_read = true
        if (stats.value.unread > 0) stats.value.unread--
    } catch { }
}

const markAllRead = async () => {
    try {
        await api.patch('/notifications/mark-all-read')
        notifications.value.forEach(n => n.is_read = true)
        stats.value.unread = 0
        toast.add({ title: 'All notifications marked as read', color: 'green' })
    } catch { }
}

const clearRead = async () => {
    if (!confirm('Clear all read notifications?')) return
    try {
        await api.delete('/notifications/clear-all')
        toast.add({ title: 'Read notifications cleared', color: 'green' })
        fetchNotifications(); fetchStats()
    } catch { }
}

const deleteNotification = async (n) => {
    try {
        await api.delete(`/notifications/${n.id}`)
        notifications.value = notifications.value.filter(x => x.id !== n.id)
        fetchStats()
    } catch { }
}

const handleSend = async () => {
    if (!sendForm.title || !sendForm.message) { toast.add({ title: 'Fill required fields', color: 'red' }); return }
    sending.value = true
    try {
        const res = await api.post('/notifications/send', sendForm)
        toast.add({ title: res.message || 'Notification sent', color: 'green' })
        showSendModal.value = false
        Object.assign(sendForm, { title: '', message: '', type: 'announcement', category: 'general', target: 'all', role: 'student', action_url: '', action_label: '' })
    } finally { sending.value = false }
}

onMounted(async () => {
    await Promise.all([fetchNotifications(), fetchStats()])
})
</script>