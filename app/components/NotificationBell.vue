<template>
    <div class="relative" ref="bellRef">
        <!-- Bell button -->
        <button @click="toggleDropdown"
            class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <UIcon name="i-heroicons-bell" class="w-5 h-5" />
            <span v-if="unreadCount > 0"
                class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
        </button>

        <!-- Dropdown -->
        <Teleport to="body">
            <div v-if="showDropdown"
                class="fixed z-200 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                :style="dropdownStyle">

                <!-- Header -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div class="flex items-center gap-2">
                        <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
                        <span v-if="unreadCount > 0"
                            class="px-1.5 py-0.5 text-[10px] font-bold text-red-700 bg-red-100 rounded-full">{{
                                unreadCount }}</span>
                    </div>
                    <div class="flex gap-1">
                        <button v-if="unreadCount > 0" @click="markAllRead"
                            class="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-0.5 rounded hover:bg-indigo-50">
                            Mark all read
                        </button>
                        <NuxtLink to="/notifications" @click="showDropdown = false"
                            class="text-xs text-gray-500 hover:text-gray-700 px-2 py-0.5 rounded hover:bg-gray-50">
                            View all
                        </NuxtLink>
                    </div>
                </div>

                <!-- Notifications list -->
                <div class="max-h-96 overflow-y-auto divide-y divide-gray-50">
                    <div v-if="loading" class="p-6 text-center">
                        <div
                            class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                        </div>
                    </div>
                    <div v-else-if="!notifications.length" class="p-8 text-center">
                        <UIcon name="i-heroicons-bell-slash" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p class="text-xs text-gray-400">No notifications</p>
                    </div>
                    <div v-else>
                        <div v-for="n in notifications" :key="n.id" @click="handleNotificationClick(n)"
                            :class="['flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors', !n.is_read ? 'bg-indigo-50/40' : '']">
                            <!-- Icon -->
                            <div
                                :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', iconBg(n.type)]">
                                <UIcon :name="iconName(n.type)" class="w-4 h-4" :class="iconColor(n.type)" />
                            </div>
                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <p
                                    :class="['text-sm truncate', !n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700']">
                                    {{ n.title }}</p>
                                <p class="text-xs text-gray-500 line-clamp-2 mt-0.5">{{ n.message }}</p>
                                <p class="text-[10px] text-gray-400 mt-1">{{ n.time_ago }}</p>
                            </div>
                            <!-- Unread dot -->
                            <div v-if="!n.is_read" class="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-2"></div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <NuxtLink to="/notifications" @click="showDropdown = false"
                        class="block text-center text-xs font-medium text-indigo-600 hover:text-indigo-800 py-1">
                        View all notifications →
                    </NuxtLink>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
const api = useApi()
const router = useRouter()
const bellRef = ref(null)
const showDropdown = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const dropdownStyle = ref({})

let refreshTimer = null

const toggleDropdown = async () => {
    showDropdown.value = !showDropdown.value
    if (showDropdown.value) {
        positionDropdown()
        await fetchRecent()
    }
}

const positionDropdown = () => {
    nextTick(() => {
        if (!bellRef.value) return
        const rect = bellRef.value.getBoundingClientRect()
        dropdownStyle.value = {
            top: `${rect.bottom + 8}px`,
            right: `${window.innerWidth - rect.right}px`,
        }
    })
}

const fetchRecent = async () => {
    loading.value = true
    try {
        const res = await api.get('/notifications/recent')
        notifications.value = res.data || []
        unreadCount.value = res.unread_count || 0
    } finally { loading.value = false }
}

const fetchUnreadCount = async () => {
    try {
        const res = await api.get('/notifications/unread-count')
        unreadCount.value = res.count || 0
    } catch { }
}

const markAllRead = async () => {
    try {
        await api.patch('/notifications/mark-all-read')
        notifications.value.forEach(n => n.is_read = true)
        unreadCount.value = 0
    } catch { }
}

const handleNotificationClick = async (n) => {
    if (!n.is_read) {
        await api.patch(`/notifications/${n.id}/read`)
        n.is_read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
    showDropdown.value = false
    if (n.action_url) router.push(n.action_url)
}

const iconName = (t) => ({ info: 'i-heroicons-information-circle', success: 'i-heroicons-check-circle', warning: 'i-heroicons-exclamation-triangle', error: 'i-heroicons-x-circle', announcement: 'i-heroicons-megaphone' }[t] || 'i-heroicons-bell')
const iconBg = (t) => ({ info: 'bg-blue-100', success: 'bg-green-100', warning: 'bg-yellow-100', error: 'bg-red-100', announcement: 'bg-purple-100' }[t] || 'bg-gray-100')
const iconColor = (t) => ({ info: 'text-blue-600', success: 'text-green-600', warning: 'text-yellow-600', error: 'text-red-600', announcement: 'text-purple-600' }[t] || 'text-gray-600')

// Close on outside click
const handleOutsideClick = (e) => {
    if (bellRef.value && !bellRef.value.contains(e.target)) {
        showDropdown.value = false
    }
}

// Auto-refresh every 30 seconds
onMounted(async () => {
    await fetchUnreadCount()
    document.addEventListener('click', handleOutsideClick)
    refreshTimer = setInterval(fetchUnreadCount, 30000)
})

onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick)
    if (refreshTimer) clearInterval(refreshTimer)
})

// Expose for parent layout to trigger refresh
defineExpose({ fetchUnreadCount })
</script>