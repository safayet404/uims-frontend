<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Permissions</h2>
                <p class="text-sm text-gray-500 mt-0.5">All system permissions grouped by module</p>
            </div>
            <div class="flex gap-2">
                <button @click="openBulkCreate"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <UIcon name="i-heroicons-squares-plus" class="w-4 h-4" /> Bulk Create
                </button>
                <button @click="openCreate"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Permission
                </button>
            </div>
        </div>

        <!-- Search -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="relative max-w-sm">
                <UIcon name="i-heroicons-magnifying-glass"
                    class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input v-model="search" @input="filterPerms" placeholder="Search permissions..."
                    autocomplete="new-password" type="search"
                    class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
            <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
            </div>
        </div>

        <!-- Grouped permissions -->
        <div v-else class="space-y-4">
            <div v-for="(perms, module) in filteredGrouped" :key="module"
                class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-gray-900 uppercase tracking-wide">{{ module }}</span>
                        <span class="text-xs text-gray-400">({{ perms.length }})</span>
                    </div>
                </div>
                <div class="divide-y divide-gray-50">
                    <div v-for="perm in perms" :key="perm.id"
                        class="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                        <div class="flex items-center gap-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', actionColor(perm.action)]">
                                {{ perm.action }}
                            </span>
                            <span class="text-sm font-mono text-gray-700">{{ perm.name }}</span>
                        </div>
                        <div class="flex gap-1">
                            <button @click="openEdit(perm)"
                                class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                            </button>
                            <button @click="confirmDelete(perm)"
                                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <p v-if="!Object.keys(filteredGrouped).length" class="text-center text-gray-400 py-12">No permissions found
            </p>
        </div>

        <!-- ── ADD/EDIT MODAL ── -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingPerm ? 'Edit Permission' :
                            'AddPermission' }}</h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Permission Name *</label>
                            <input v-model="form.name" placeholder="module.action (e.g. students.export)"
                                autocomplete="off"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-mono" />
                            <p class="text-xs text-gray-400 mt-1">Use lowercase dot notation: module.action</p>
                            <p v-if="formErrors.name" class="text-red-500 text-xs mt-1">{{ formErrors.name }}</p>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSubmit" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving ? 'Saving...' : (editingPerm ? 'Save' : 'Create') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── BULK CREATE MODAL ── -->
        <Teleport to="body">
            <div v-if="showBulkModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Bulk Create Permissions</h3>
                        <button @click="showBulkModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Module Name *</label>
                            <input v-model="bulkForm.module" placeholder="e.g. reports" autocomplete="off"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Actions *</label>
                            <div class="flex flex-wrap gap-2">
                                <label v-for="action in allActions" :key="action"
                                    class="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" :value="action" v-model="bulkForm.actions"
                                        class="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                                    <span class="text-sm text-gray-700">{{ action }}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showBulkModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleBulkCreate" :disabled="bulkCreating"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ bulkCreating ? 'Creating...' : 'Create Permissions' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── DELETE MODAL ── -->
        <Teleport to="body">
            <div v-if="showDeleteModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-red-600">Delete Permission</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-gray-600">Delete permission <strong class="font-mono">{{
                            deletingPerm?.name }}</strong>? This will remove it from all roles.</p>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showDeleteModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleDelete" :disabled="deleting"
                            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                            {{ deleting ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const ui = useUiStore()
const api = useApi()
const toast = useToast()

ui.setPageTitle('Permissions')

const permissions = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const bulkCreating = ref(false)
const search = ref('')

const showModal = ref(false)
const showBulkModal = ref(false)
const showDeleteModal = ref(false)

const editingPerm = ref(null)
const deletingPerm = ref(null)
const formErrors = ref({})
const form = reactive({ name: '' })
const bulkForm = reactive({ module: '', actions: ['read', 'create', 'edit', 'delete'] })

const allActions = ['read', 'create', 'edit', 'delete', 'export', 'import', 'approve', 'reject']

const grouped = computed(() => {
    const g = {}
    for (const p of permissions.value) {
        const parts = p.name.split('.')
        const module = parts[0] || 'general'
        const action = parts[1] || p.name
        if (!g[module]) g[module] = []
        g[module].push({ ...p, action })
    }
    return g
})

const filteredGrouped = computed(() => {
    if (!search.value) return grouped.value
    const s = search.value.toLowerCase()
    const g = {}
    for (const [mod, perms] of Object.entries(grouped.value)) {
        const filtered = perms.filter(p => p.name.includes(s) || mod.includes(s))
        if (filtered.length) g[mod] = filtered
    }
    return g
})

const filterPerms = () => { } // reactive computed handles it

const actionColor = (action) => ({
    read: 'text-blue-700 bg-blue-50',
    create: 'text-green-700 bg-green-50',
    edit: 'text-amber-700 bg-amber-50',
    delete: 'text-red-700 bg-red-50',
    export: 'text-purple-700 bg-purple-50',
    import: 'text-indigo-700 bg-indigo-50',
    approve: 'text-teal-700 bg-teal-50',
    reject: 'text-rose-700 bg-rose-50',
}[action] || 'text-gray-700 bg-gray-100')

const fetchPermissions = async () => {
    loading.value = true
    try {
        const res = await api.get('/permissions', { per_page: 200 })
        permissions.value = res.data || []
    } finally { loading.value = false }
}

const openCreate = () => {
    editingPerm.value = null; form.name = ''; formErrors.value = {}; showModal.value = true
}

const openEdit = (perm) => {
    editingPerm.value = perm; form.name = perm.name; formErrors.value = {}; showModal.value = true
}

const handleSubmit = async () => {
    if (!form.name) { formErrors.value.name = 'Required'; return }
    saving.value = true
    try {
        editingPerm.value
            ? await api.put(`/permissions/${editingPerm.value.id}`, { name: form.name })
            : await api.post('/permissions', { name: form.name })
        toast.add({ title: editingPerm.value ? 'Permission updated' : 'Permission created', color: 'green' })
        showModal.value = false; fetchPermissions()
    } catch (err) {
        formErrors.value.name = err?.data?.errors?.name?.[0] || 'Error'
    } finally { saving.value = false }
}

const openBulkCreate = () => {
    bulkForm.module = ''; bulkForm.actions = ['read', 'create', 'edit', 'delete']
    showBulkModal.value = true
}

const handleBulkCreate = async () => {
    if (!bulkForm.module || !bulkForm.actions.length) return
    bulkCreating.value = true
    try {
        const res = await api.post('/permissions/bulk', { module: bulkForm.module, actions: bulkForm.actions })
        toast.add({ title: `${res.created?.length || 0} permissions created`, color: 'green' })
        showBulkModal.value = false; fetchPermissions()
    } finally { bulkCreating.value = false }
}

const confirmDelete = (perm) => { deletingPerm.value = perm; showDeleteModal.value = true }

const handleDelete = async () => {
    deleting.value = true
    try {
        await api.delete(`/permissions/${deletingPerm.value.id}`)
        toast.add({ title: 'Permission deleted', color: 'green' })
        showDeleteModal.value = false; fetchPermissions()
    } finally { deleting.value = false }
}

onMounted(fetchPermissions)
</script>