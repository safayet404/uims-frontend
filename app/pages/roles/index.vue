<template>
    <div class="space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Roles</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage roles and their permissions</p>
            </div>
            <button @click="openCreate"
                class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Role
            </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="i in 6" :key="i" class="bg-white rounded-xl border border-gray-200 p-5 h-28 animate-pulse" />
        </div>

        <!-- Roles grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="role in roles" :key="role.id"
                class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <p class="text-xs text-gray-400 mb-0.5">Total {{ role.users_count }} users</p>
                        <h3 class="text-base font-bold text-gray-900 uppercase tracking-wide">{{ role.name }}</h3>
                    </div>
                    <div class="flex gap-1">
                        <!-- History -->
                        <button @click="openHistory(role)" title="Permission history"
                            class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                        </button>
                        <!-- Clone -->
                        <button @click="openClone(role)" title="Clone role"
                            class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <UIcon name="i-heroicons-document-duplicate" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex flex-wrap gap-1">
                        <span class="text-xs text-gray-400">{{ role.permissions_count }} permissions</span>
                    </div>
                    <button @click="openPermissions(role)"
                        class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                        Edit Role →
                    </button>
                </div>
            </div>
        </div>

        <!-- ── CREATE ROLE MODAL ── -->
        <Teleport to="body">
            <div v-if="showCreateModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Add New Role</h3>
                        <button @click="showCreateModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                            <input v-model="createForm.name" placeholder="e.g. department-head" autocomplete="off"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            <p class="text-xs text-gray-400 mt-1">Use lowercase with dashes (e.g. department-head)</p>
                            <p v-if="createErrors.name" class="text-red-500 text-xs mt-1">{{ createErrors.name }}</p>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showCreateModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleCreate" :disabled="creating"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ creating ? 'Creating...' : 'Create Role' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── PERMISSION MATRIX MODAL ── -->
        <Teleport to="body">
            <div v-if="showPermModal && activeRole"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">Edit Role — <span
                                    class="text-indigo-600 uppercase">{{ activeRole.name }}</span></h3>
                            <p class="text-xs text-gray-400 mt-0.5">Set role permissions per module</p>
                        </div>
                        <button @click="showPermModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Role name edit -->
                    <div class="px-6 py-3 border-b border-gray-100 shrink-0">
                        <label class="block text-xs font-medium text-gray-500 mb-1">Role Name</label>
                        <input v-model="roleNameEdit" autocomplete="off"
                            class="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                    </div>

                    <!-- Permission matrix -->
                    <div v-if="loadingPerms" class="flex-1 flex items-center justify-center p-8">
                        <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin">
                        </div>
                    </div>
                    <div v-else class="flex-1 overflow-y-auto px-6 py-4">
                        <div class="mb-3 flex items-center gap-3">
                            <button @click="selectAll" class="text-xs text-indigo-600 hover:underline">Select
                                All</button>
                            <span class="text-gray-300">|</span>
                            <button @click="deselectAll" class="text-xs text-gray-500 hover:underline">Deselect
                                All</button>
                        </div>
                        <table class="w-full">
                            <thead class="sticky top-0 bg-white">
                                <tr class="border-b border-gray-200">
                                    <th class="py-2 text-left text-xs font-semibold text-gray-500 uppercase w-1/3">
                                        Module</th>
                                    <th class="py-2 text-center text-xs font-semibold text-gray-500 uppercase">Read</th>
                                    <th class="py-2 text-center text-xs font-semibold text-gray-500 uppercase">Create
                                    </th>
                                    <th class="py-2 text-center text-xs font-semibold text-gray-500 uppercase">Edit</th>
                                    <th class="py-2 text-center text-xs font-semibold text-gray-500 uppercase">Delete
                                    </th>
                                    <th class="py-2 text-center text-xs font-semibold text-gray-500 uppercase">Other
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                <tr v-for="mod in permModules" :key="mod.module" class="hover:bg-gray-50">
                                    <td class="py-3 pr-4">
                                        <span class="text-sm font-medium text-gray-900 capitalize">{{ mod.module
                                            }}</span>
                                    </td>
                                    <td class="py-3 text-center"
                                        v-for="action in ['read', 'create', 'edit', 'delete', 'other']" :key="action">
                                        <template v-if="getPermission(mod.module, action)">
                                            <input type="checkbox"
                                                :checked="permMatrix[getPermission(mod.module, action).name]"
                                                @change="togglePerm(getPermission(mod.module, action).name)"
                                                class="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer" />
                                        </template>
                                        <span v-else class="text-gray-200">—</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
                        <button @click="showPermModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="savePermissions" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving ? 'Saving...' : 'Save Permissions' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── CLONE ROLE MODAL ── -->
        <Teleport to="body">
            <div v-if="showCloneModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Clone Role</h3>
                        <button @click="showCloneModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-3">
                        <p class="text-sm text-gray-600">Cloning permissions from <strong
                                class="text-indigo-600 uppercase">{{
                                    cloneSource?.name }}</strong></p>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">New Role Name *</label>
                            <input v-model="cloneName" placeholder="e.g. senior-faculty" autocomplete="off"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showCloneModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleClone" :disabled="cloning"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ cloning ? 'Cloning...' : 'Clone Role' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── HISTORY MODAL ── -->
        <Teleport to="body">
            <div v-if="showHistoryModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">Permission Change History</h3>
                            <p class="text-xs text-gray-400 mt-0.5 uppercase">{{ historyRole?.name }}</p>
                        </div>
                        <button @click="showHistoryModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-6">
                        <div v-if="loadingHistory" class="text-center py-8">
                            <div
                                class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                            </div>
                        </div>
                        <div v-else-if="!history.length" class="text-center py-8 text-gray-400 text-sm">No history
                            found.</div>
                        <div v-else class="space-y-4">
                            <div v-for="log in history" :key="log.id" class="border border-gray-100 rounded-xl p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full bg-indigo-400"></div>
                                        <span class="text-sm font-medium text-gray-900">{{ log.user?.name }}</span>
                                        <span class="text-xs text-gray-400">({{ log.user?.email }})</span>
                                    </div>
                                    <span class="text-xs text-gray-400">{{ formatDate(log.created_at) }}</span>
                                </div>
                                <div v-if="log.new_values?.granted?.length" class="flex flex-wrap gap-1 mb-1">
                                    <span class="text-xs text-gray-500 mr-1">Granted:</span>
                                    <span v-for="p in log.new_values.granted" :key="p"
                                        class="inline-flex px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded-full">{{
                                            p }}</span>
                                </div>
                                <div v-if="log.new_values?.revoked?.length" class="flex flex-wrap gap-1">
                                    <span class="text-xs text-gray-500 mr-1">Revoked:</span>
                                    <span v-for="p in log.new_values.revoked" :key="p"
                                        class="inline-flex px-2 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded-full">{{
                                            p }}</span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2">IP: {{ log.ip_address }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="px-6 py-4 border-t border-gray-100 shrink-0 text-right">
                        <button @click="showHistoryModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const ui = useUiStore()
const api = useApi()
const toast = useToast()

ui.setPageTitle('Roles & Permissions')

const roles = ref([])
const loading = ref(false)
const creating = ref(false)
const saving = ref(false)
const cloning = ref(false)
const loadingPerms = ref(false)
const loadingHistory = ref(false)

const showCreateModal = ref(false)
const showPermModal = ref(false)
const showCloneModal = ref(false)
const showHistoryModal = ref(false)

const activeRole = ref(null)
const cloneSource = ref(null)
const historyRole = ref(null)
const createErrors = ref({})
const createForm = reactive({ name: '' })
const roleNameEdit = ref('')
const cloneName = ref('')

const permModules = ref([])
const permMatrix = ref({})
const history = ref([])

const ACTIONS = ['read', 'create', 'edit', 'delete', 'other']

const formatDate = (d) => dayjs(d).format('MMM D, YYYY HH:mm')

// ── Fetch roles ───────────────────────────────────────────────
const fetchRoles = async () => {
    loading.value = true
    try {
        const res = await api.get('/roles')
        roles.value = res.data || []
    } finally { loading.value = false }
}

// ── Create role ───────────────────────────────────────────────
const openCreate = () => {
    createForm.name = ''; createErrors.value = {}; showCreateModal.value = true
}

const handleCreate = async () => {
    if (!createForm.name) { createErrors.value.name = 'Required'; return }
    creating.value = true
    try {
        await api.post('/roles', { name: createForm.name })
        toast.add({ title: 'Role created', color: 'green' })
        showCreateModal.value = false; fetchRoles()
    } catch (err) {
        createErrors.value.name = err?.data?.errors?.name?.[0] || 'Error'
    } finally { creating.value = false }
}

// ── Permission matrix ─────────────────────────────────────────
const openPermissions = async (role) => {
    activeRole.value = role
    roleNameEdit.value = role.name
    permModules.value = []
    permMatrix.value = {}
    showPermModal.value = true
    loadingPerms.value = true
    try {
        const res = await api.get(`/roles/${role.id}/permissions`)
        const modules = res.modules || []
        permModules.value = modules

        // Build matrix
        const matrix = {}
        for (const mod of modules) {
            for (const perm of mod.permissions) {
                matrix[perm.name] = perm.granted
            }
        }
        permMatrix.value = matrix
    } finally { loadingPerms.value = false }
}

const getPermission = (module, action) => {
    const mod = permModules.value.find(m => m.module === module)
    if (!mod) return null
    if (action === 'other') {
        return mod.permissions.find(p => !['read', 'create', 'edit', 'delete'].includes(p.action)) || null
    }
    return mod.permissions.find(p => p.action === action) || null
}

const togglePerm = (name) => {
    permMatrix.value = { ...permMatrix.value, [name]: !permMatrix.value[name] }
}

const selectAll = () => { const m = {}; Object.keys(permMatrix.value).forEach(k => m[k] = true); permMatrix.value = m }
const deselectAll = () => { const m = {}; Object.keys(permMatrix.value).forEach(k => m[k] = false); permMatrix.value = m }

const savePermissions = async () => {
    saving.value = true
    try {
        // Update role name if changed
        if (roleNameEdit.value !== activeRole.value.name) {
            await api.put(`/roles/${activeRole.value.id}`, { name: roleNameEdit.value })
        }
        await api.patch(`/roles/${activeRole.value.id}/permissions`, { permissions: permMatrix.value })
        toast.add({ title: 'Permissions saved', color: 'green' })
        showPermModal.value = false; fetchRoles()
    } catch { toast.add({ title: 'Failed to save', color: 'red' }) }
    finally { saving.value = false }
}

// ── Clone role ────────────────────────────────────────────────
const openClone = (role) => { cloneSource.value = role; cloneName.value = ''; showCloneModal.value = true }

const handleClone = async () => {
    if (!cloneName.value) return
    cloning.value = true
    try {
        await api.post(`/roles/${cloneSource.value.id}/clone`, { name: cloneName.value })
        toast.add({ title: 'Role cloned', color: 'green' })
        showCloneModal.value = false; fetchRoles()
    } catch (err) {
        toast.add({ title: err?.data?.message || 'Clone failed', color: 'red' })
    } finally { cloning.value = false }
}

// ── History ───────────────────────────────────────────────────
const openHistory = async (role) => {
    historyRole.value = role
    history.value = []
    showHistoryModal.value = true
    loadingHistory.value = true
    try {
        const res = await api.get(`/roles/${role.id}/history`)
        history.value = res.data || []
    } finally { loadingHistory.value = false }
}

onMounted(fetchRoles)
</script>