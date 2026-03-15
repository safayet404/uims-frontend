<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Settings</h2>
                <p class="text-sm text-gray-500 mt-0.5">Configure system preferences and policies</p>
            </div>
        </div>

        <div class="flex gap-6">
            <!-- Sidebar tabs -->
            <div class="w-48 shrink-0 space-y-1">
                <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                    :class="['w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left', activeTab === tab.key ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100']">
                    <UIcon :name="tab.icon" class="w-4 h-4 shrink-0" />
                    {{ tab.label }}
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
                <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div
                        class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                    </div>
                </div>

                <!-- ── GENERAL ── -->
                <div v-else-if="activeTab === 'general'"
                    class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-base font-semibold text-gray-900">General Settings</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Basic university information</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div v-for="key in generalKeys" :key="key">
                                <label class="block text-xs font-medium text-gray-600 mb-1">{{ getLabel('general', key)
                                }}</label>
                                <input v-model="forms.general[key]" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end px-6 py-4 border-t border-gray-100">
                        <button @click="saveGroup('general')" :disabled="saving === 'general'"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving === 'general' ? 'Saving...' : 'Save General Settings' }}
                        </button>
                    </div>
                </div>

                <!-- ── ACADEMIC ── -->
                <div v-else-if="activeTab === 'academic'"
                    class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-base font-semibold text-gray-900">Academic Settings</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Semester, grading and registration policies</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <template v-for="(val, key) in allSettings.academic" :key="key">
                                <div v-if="val.type === 'boolean'"
                                    class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">{{ val.label }}</p>
                                        <p v-if="val.description" class="text-xs text-gray-500 mt-0.5">{{
                                            val.description }}</p>
                                    </div>
                                    <button @click="forms.academic[key] = !forms.academic[key]"
                                        :class="['w-11 h-6 rounded-full transition-colors relative', forms.academic[key] ? 'bg-indigo-600' : 'bg-gray-300']">
                                        <span
                                            :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', forms.academic[key] ? 'translate-x-5' : 'translate-x-0.5']" />
                                    </button>
                                </div>
                                <div v-else>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">{{ val.label }}</label>
                                    <input v-model="forms.academic[key]" autocomplete="new-password"
                                        :type="val.type === 'integer' ? 'number' : 'text'"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="flex justify-end px-6 py-4 border-t border-gray-100">
                        <button @click="saveGroup('academic')" :disabled="saving === 'academic'"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving === 'academic' ? 'Saving...' : 'Save Academic Settings' }}
                        </button>
                    </div>
                </div>

                <!-- ── SECURITY ── -->
                <div v-else-if="activeTab === 'security'"
                    class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-base font-semibold text-gray-900">Security Settings</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Password policies and session management</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="space-y-3">
                            <template v-for="(val, key) in allSettings.security" :key="key">
                                <div v-if="val.type === 'boolean'"
                                    class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">{{ val.label }}</p>
                                    </div>
                                    <button @click="forms.security[key] = !forms.security[key]"
                                        :class="['w-11 h-6 rounded-full transition-colors relative', forms.security[key] ? 'bg-indigo-600' : 'bg-gray-300']">
                                        <span
                                            :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', forms.security[key] ? 'translate-x-5' : 'translate-x-0.5']" />
                                    </button>
                                </div>
                                <div v-else class="flex items-center gap-4">
                                    <label class="w-56 text-sm font-medium text-gray-700 shrink-0">{{ val.label
                                    }}</label>
                                    <input v-model="forms.security[key]" type="number" min="0"
                                        class="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="flex justify-end px-6 py-4 border-t border-gray-100">
                        <button @click="saveGroup('security')" :disabled="saving === 'security'"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving === 'security' ? 'Saving...' : 'Save Security Settings' }}
                        </button>
                    </div>
                </div>

                <!-- ── NOTIFICATIONS ── -->
                <div v-else-if="activeTab === 'notifications'"
                    class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-base font-semibold text-gray-900">Notification Settings</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Control what notifications are sent</p>
                    </div>
                    <div class="p-6 space-y-3">
                        <template v-for="(val, key) in allSettings.notifications" :key="key">
                            <div v-if="val.type === 'boolean'"
                                class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                <div>
                                    <p class="text-sm font-medium text-gray-900">{{ val.label }}</p>
                                </div>
                                <button @click="forms.notifications[key] = !forms.notifications[key]"
                                    :class="['w-11 h-6 rounded-full transition-colors relative', forms.notifications[key] ? 'bg-green-500' : 'bg-gray-300']">
                                    <span
                                        :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', forms.notifications[key] ? 'translate-x-5' : 'translate-x-0.5']" />
                                </button>
                            </div>
                            <div v-else class="flex items-center gap-4">
                                <label class="w-56 text-sm font-medium text-gray-700 shrink-0">{{ val.label }}</label>
                                <input v-model="forms.notifications[key]" type="number" min="0"
                                    class="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <span class="text-xs text-gray-500">days</span>
                            </div>
                        </template>
                    </div>
                    <div class="flex justify-end px-6 py-4 border-t border-gray-100">
                        <button @click="saveGroup('notifications')" :disabled="saving === 'notifications'"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving === 'notifications' ? 'Saving...' : 'Save Notification Settings' }}
                        </button>
                    </div>
                </div>

                <!-- ── APPEARANCE ── -->
                <div v-else-if="activeTab === 'appearance'"
                    class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-base font-semibold text-gray-900">Appearance Settings</h3>
                        <p class="text-xs text-gray-500 mt-0.5">UI preferences and display options</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-2">Primary Color</label>
                            <div class="flex items-center gap-3">
                                <div class="flex gap-2 flex-wrap">
                                    <button v-for="c in colorPresets" :key="c.value"
                                        @click="forms.appearance.primary_color = c.value" :title="c.label"
                                        :class="['w-8 h-8 rounded-full border-2 transition-transform hover:scale-110', forms.appearance.primary_color === c.value ? 'border-gray-800 scale-110' : 'border-transparent']"
                                        :style="`background:${c.value}`" />
                                </div>
                                <div class="flex items-center gap-2">
                                    <input v-model="forms.appearance.primary_color" autocomplete="new-password"
                                        placeholder="#4f46e5"
                                        class="w-28 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-mono" />
                                    <div class="w-8 h-8 rounded-lg border border-gray-200"
                                        :style="`background:${forms.appearance.primary_color}`"></div>
                                </div>
                            </div>
                        </div>
                        <template v-for="(val, key) in allSettings.appearance" :key="key">
                            <div v-if="key === 'primary_color'" class="hidden"></div>
                            <div v-else-if="val.type === 'boolean'"
                                class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                <p class="text-sm font-medium text-gray-900">{{ val.label }}</p>
                                <button @click="forms.appearance[key] = !forms.appearance[key]"
                                    :class="['w-11 h-6 rounded-full transition-colors relative', forms.appearance[key] ? 'bg-indigo-600' : 'bg-gray-300']">
                                    <span
                                        :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', forms.appearance[key] ? 'translate-x-5' : 'translate-x-0.5']" />
                                </button>
                            </div>
                            <div v-else class="flex items-center gap-4">
                                <label class="w-48 text-sm font-medium text-gray-700 shrink-0">{{ val.label }}</label>
                                <input v-if="val.type === 'integer'" v-model="forms.appearance[key]" type="number"
                                    min="1"
                                    class="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <select v-else-if="key === 'sidebar_style'" v-model="forms.appearance[key]"
                                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="default">Default</option>
                                    <option value="compact">Compact</option>
                                    <option value="minimal">Minimal</option>
                                </select>
                            </div>
                        </template>
                    </div>
                    <div class="flex justify-end px-6 py-4 border-t border-gray-100">
                        <button @click="saveGroup('appearance')" :disabled="saving === 'appearance'"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving === 'appearance' ? 'Saving...' : 'Save Appearance Settings' }}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const ui = useUiStore()
const api = useApi()
const toast = useToast()

ui.setPageTitle('Settings')

const loading = ref(false)
const saving = ref('')
const allSettings = ref({})

const activeTab = ref('general')

const tabs = [
    { key: 'general', label: 'General', icon: 'i-heroicons-building-office' },
    { key: 'academic', label: 'Academic', icon: 'i-heroicons-academic-cap' },
    { key: 'security', label: 'Security', icon: 'i-heroicons-shield-check' },
    { key: 'notifications', label: 'Notifications', icon: 'i-heroicons-bell' },
    { key: 'appearance', label: 'Appearance', icon: 'i-heroicons-paint-brush' },
]

const forms = reactive({
    general: {},
    academic: {},
    security: {},
    notifications: {},
    appearance: {},
})

const generalKeys = [
    'university_name', 'university_short', 'university_tagline',
    'university_address', 'university_email', 'university_phone',
    'university_website', 'established_year', 'timezone',
    'date_format', 'currency', 'currency_symbol',
]

const colorPresets = [
    { label: 'Indigo', value: '#4f46e5' },
    { label: 'Blue', value: '#2563eb' },
    { label: 'Purple', value: '#7c3aed' },
    { label: 'Pink', value: '#db2777' },
    { label: 'Red', value: '#dc2626' },
    { label: 'Orange', value: '#ea580c' },
    { label: 'Green', value: '#16a34a' },
    { label: 'Teal', value: '#0d9488' },
]

const getLabel = (group, key) => allSettings.value[group]?.[key]?.label || key

const fetchSettings = async () => {
    loading.value = true
    try {
        const res = await api.get('/settings')
        allSettings.value = res.data || {}

        // Populate forms
        for (const group of Object.keys(forms)) {
            const groupData = res.data[group] || {}
            forms[group] = Object.fromEntries(
                Object.entries(groupData).map(([k, v]) => [k, v.value])
            )
        }
    } finally { loading.value = false }
}

const saveGroup = async (group) => {
    saving.value = group
    try {
        const res = await api.put(`/settings/${group}`, { settings: forms[group] })
        toast.add({ title: res.message || 'Settings saved', color: 'green' })
    } catch {
        toast.add({ title: 'Failed to save settings', color: 'red' })
    } finally { saving.value = '' }
}

onMounted(fetchSettings)
</script>