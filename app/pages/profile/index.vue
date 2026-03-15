<template>
    <div class="space-y-5 max-w-4xl">

        <!-- Header -->
        <div>
            <h2 class="text-xl font-bold text-gray-900">My Profile</h2>
            <p class="text-sm text-gray-500 mt-0.5">Manage your account information and preferences</p>
        </div>

        <!-- Profile hero card -->
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <!-- Cover -->
            <div class="h-24 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <!-- Avatar + basic info -->
            <div class="px-6 pb-6">
                <div class="flex items-end gap-4 -mt-10 mb-4">
                    <!-- Avatar -->
                    <div class="relative group">
                        <img :src="auth.user?.avatar_url" :alt="auth.user?.name"
                            class="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-md" />
                        <button @click="triggerAvatarUpload"
                            class="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <UIcon name="i-heroicons-camera" class="w-5 h-5 text-white" />
                        </button>
                        <input ref="avatarInput" type="file" accept="image/*" class="hidden"
                            @change="handleAvatarUpload" />
                    </div>
                    <div class="flex-1 min-w-0 pt-12">
                        <h3 class="text-xl font-bold text-gray-900">{{ auth.user?.name }}</h3>
                        <div class="flex items-center gap-2 flex-wrap mt-1">
                            <span v-for="role in auth.roles" :key="role"
                                class="inline-flex px-2 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full capitalize">
                                {{ role.replace('-', ' ') }}
                            </span>
                            <span class="inline-flex items-center gap-1 text-xs text-gray-500">
                                <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Active
                            </span>
                        </div>
                    </div>
                    <div class="hidden sm:flex items-center gap-4 text-center pt-12">
                        <div>
                            <p class="text-lg font-bold text-gray-900">{{ auth.user?.employee_id ||
                                auth.user?.student_id || '—' }}</p>
                            <p class="text-xs text-gray-400">ID</p>
                        </div>
                        <div class="w-px h-8 bg-gray-200"></div>
                        <div>
                            <p class="text-lg font-bold text-gray-900">{{ memberSince }}</p>
                            <p class="text-xs text-gray-400">Member Since</p>
                        </div>
                    </div>
                </div>

                <!-- Upload status -->
                <div v-if="uploadingAvatar" class="flex items-center gap-2 text-sm text-indigo-600 mb-3">
                    <div class="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin">
                    </div>
                    Uploading avatar...
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- Left column: forms -->
            <div class="lg:col-span-2 space-y-5">

                <!-- Personal Information -->
                <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-base font-semibold text-gray-900">Personal Information</h3>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                                <input v-model="profileForm.name" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                <input v-model="profileForm.email" type="text" inputmode="email"
                                    autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                <input v-model="profileForm.phone" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                                <select v-model="profileForm.gender"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                                <input v-model="profileForm.date_of_birth" type="text" autocomplete="new-password"
                                    placeholder="YYYY-MM-DD"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">City</label>
                                <input v-model="profileForm.city" autocomplete="new-password" placeholder="Dhaka"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Country</label>
                                <input v-model="profileForm.country" autocomplete="new-password"
                                    placeholder="Bangladesh"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Address</label>
                                <textarea v-model="profileForm.address" rows="2" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 resize-none"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end px-6 py-4 border-t border-gray-100">
                        <button @click="saveProfile" :disabled="savingProfile"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ savingProfile ? 'Saving...' : 'Save Profile' }}
                        </button>
                    </div>
                </div>

                <!-- Change Password -->
                <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-base font-semibold text-gray-900">Change Password</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Leave blank to keep current password</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                            <div class="relative">
                                <input v-model="passwordForm.current_password"
                                    :type="showCurrentPwd ? 'text' : 'password'" autocomplete="current-password"
                                    class="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <button @click="showCurrentPwd = !showCurrentPwd"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <UIcon :name="showCurrentPwd ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                                        class="w-4 h-4" />
                                </button>
                            </div>
                            <p v-if="passwordErrors.current_password" class="text-red-500 text-xs mt-1">{{
                                passwordErrors.current_password }}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                            <div class="relative">
                                <input v-model="passwordForm.password" :type="showNewPwd ? 'text' : 'password'"
                                    autocomplete="new-password"
                                    class="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <button @click="showNewPwd = !showNewPwd"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <UIcon :name="showNewPwd ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                                        class="w-4 h-4" />
                                </button>
                            </div>
                            <!-- Password strength -->
                            <div v-if="passwordForm.password" class="mt-2">
                                <div class="flex gap-1">
                                    <div v-for="i in 4" :key="i"
                                        :class="['h-1 flex-1 rounded-full', i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200']">
                                    </div>
                                </div>
                                <p :class="['text-xs mt-1', passwordStrength.textColor]">{{ passwordStrength.label }}
                                </p>
                            </div>
                            <p v-if="passwordErrors.password" class="text-red-500 text-xs mt-1">{{
                                passwordErrors.password }}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                            <div class="relative">
                                <input v-model="passwordForm.password_confirmation"
                                    :type="showConfirmPwd ? 'text' : 'password'" autocomplete="new-password"
                                    class="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <button @click="showConfirmPwd = !showConfirmPwd"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <UIcon :name="showConfirmPwd ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                                        class="w-4 h-4" />
                                </button>
                            </div>
                            <p v-if="passwordForm.password_confirmation && passwordForm.password !== passwordForm.password_confirmation"
                                class="text-red-500 text-xs mt-1">Passwords do not match</p>
                        </div>
                    </div>
                    <div class="flex justify-end px-6 py-4 border-t border-gray-100">
                        <button @click="changePassword"
                            :disabled="savingPassword || !passwordForm.current_password || !passwordForm.password"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ savingPassword ? 'Updating...' : 'Update Password' }}
                        </button>
                    </div>
                </div>

            </div>

            <!-- Right column: account info + activity -->
            <div class="space-y-5">

                <!-- Account Info -->
                <div class="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                    <h3 class="text-base font-semibold text-gray-900">Account Info</h3>
                    <div v-for="info in accountInfo" :key="info.label" class="flex flex-col gap-0.5">
                        <p class="text-xs text-gray-400">{{ info.label }}</p>
                        <p class="text-sm font-medium text-gray-900">{{ info.value || '—' }}</p>
                    </div>
                </div>

                <!-- Permissions summary -->
                <div class="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 class="text-base font-semibold text-gray-900 mb-3">My Roles</h3>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="role in auth.roles" :key="role"
                            class="inline-flex px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full capitalize">
                            {{ role.replace('-', ' ') }}
                        </span>
                    </div>
                    <p class="text-xs text-gray-400 mt-3">{{ auth.permissions?.length || 0 }} permissions assigned</p>
                </div>

                <!-- Recent Activity -->
                <div class="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 class="text-base font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div v-if="loadingActivity" class="text-center py-4">
                        <div
                            class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                        </div>
                    </div>
                    <div v-else-if="!activity.length" class="text-center py-4">
                        <p class="text-xs text-gray-400">No recent activity</p>
                    </div>
                    <div v-else class="space-y-3">
                        <div v-for="a in activity" :key="a.id" class="flex gap-3">
                            <div class="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                <UIcon name="i-heroicons-bolt" class="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-medium text-gray-900 truncate">{{ a.description }}</p>
                                <p class="text-xs text-gray-400">{{ a.time_ago }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Danger zone -->
                <div class="bg-red-50 rounded-2xl border border-red-200 p-5">
                    <h3 class="text-base font-semibold text-red-700 mb-2">Danger Zone</h3>
                    <p class="text-xs text-red-600 mb-3">These actions are irreversible. Please be careful.</p>
                    <button @click="confirmLogoutAll"
                        class="w-full px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50">
                        Logout All Devices
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const auth = useAuthStore()
const ui = useUiStore()
const api = useApi()
const toast = useToast()

ui.setPageTitle('My Profile')

const avatarInput = ref(null)
const uploadingAvatar = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)
const loadingActivity = ref(false)
const activity = ref([])
const passwordErrors = ref({})
const showCurrentPwd = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)

const profileForm = reactive({
    name: '', email: '', phone: '', gender: '',
    date_of_birth: '', city: '', country: '', address: '',
})

const passwordForm = reactive({
    current_password: '', password: '', password_confirmation: '',
})

const memberSince = computed(() => {
    if (!auth.user?.created_at) return '—'
    return new Date(auth.user.created_at).getFullYear()
})

const accountInfo = computed(() => [
    { label: 'Email', value: auth.user?.email },
    { label: 'Employee ID', value: auth.user?.employee_id },
    { label: 'Student ID', value: auth.user?.student_id },
    { label: 'Last Login', value: auth.user?.last_login_at ? new Date(auth.user.last_login_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never' },
    { label: 'Member Since', value: auth.user?.created_at ? new Date(auth.user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { label: 'Status', value: auth.user?.status ? auth.user.status.charAt(0).toUpperCase() + auth.user.status.slice(1) : '—' },
])

const passwordStrength = computed(() => {
    const pwd = passwordForm.password
    if (!pwd) return { score: 0, label: '', color: '', textColor: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++
    const map = [
        { score: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' },
        { score: 2, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
        { score: 3, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' },
        { score: 4, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' },
    ]
    return { score, ...map[Math.min(score - 1, 3)] }
})

// Populate form from auth store
const populateForm = () => {
    const u = auth.user
    if (!u) return
    Object.assign(profileForm, {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        gender: u.gender || '',
        date_of_birth: u.date_of_birth || '',
        city: u.city || '',
        country: u.country || '',
        address: u.address || '',
    })
}

const saveProfile = async () => {
    savingProfile.value = true
    try {
        const res = await api.put('/auth/profile', profileForm)
        await auth.fetchMe()
        toast.add({ title: 'Profile updated successfully', color: 'green' })
    } catch (err) {
        toast.add({ title: err?.data?.message || 'Failed to save profile', color: 'red' })
    } finally { savingProfile.value = false }
}

const changePassword = async () => {
    passwordErrors.value = {}
    if (passwordForm.password !== passwordForm.password_confirmation) {
        toast.add({ title: 'Passwords do not match', color: 'red' }); return
    }
    savingPassword.value = true
    try {
        await api.put('/auth/change-password', passwordForm)
        toast.add({ title: 'Password updated successfully', color: 'green' })
        Object.assign(passwordForm, { current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
        const errs = err?.data?.errors || {}
        passwordErrors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
        toast.add({ title: err?.data?.message || 'Failed to update password', color: 'red' })
    } finally { savingPassword.value = false }
}

const triggerAvatarUpload = () => avatarInput.value?.click()

const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.add({ title: 'Image must be under 2MB', color: 'red' }); return }
    uploadingAvatar.value = true
    try {
        const formData = new FormData()
        formData.append('avatar', file)
        await api.upload('/auth/avatar', formData)
        await auth.fetchMe()
        toast.add({ title: 'Avatar updated', color: 'green' })
    } catch {
        toast.add({ title: 'Failed to upload avatar', color: 'red' })
    } finally { uploadingAvatar.value = false; e.target.value = '' }
}

const fetchActivity = async () => {
    loadingActivity.value = true
    try {
        const userId = auth.user?.id
        if (!userId) return
        const res = await api.get(`/users/${userId}/activity`)
        activity.value = (res.data || []).slice(0, 8).map(a => ({
            id: a.id,
            description: a.description || a.event,
            time_ago: a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '',
        }))
    } catch { } finally { loadingActivity.value = false }
}

const confirmLogoutAll = async () => {
    if (!confirm('This will log you out of all devices. Continue?')) return
    await auth.logout()
    navigateTo('/login')
}

onMounted(async () => {
    await auth.fetchMe()
    populateForm()
    fetchActivity()
})

watch(() => auth.user, populateForm)
</script>