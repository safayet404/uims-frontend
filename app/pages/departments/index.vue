<template>
    <div class="space-y-5">

        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Departments</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage university departments</p>
            </div>
            <button @click="openCreate"
                class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Department
            </button>
        </div>

        <!-- Grid -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="i in 6" :key="i" class="bg-white rounded-xl border border-gray-200 p-5 h-32 animate-pulse" />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="d in departments" :key="d.id"
                class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-bold text-white bg-indigo-600 px-2 py-0.5 rounded">{{ d.code
                            }}</span>
                            <span
                                :class="['text-xs px-2 py-0.5 rounded-full', d.status === 'active' ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100']">{{
                                    d.status }}</span>
                        </div>
                        <h3 class="text-sm font-bold text-gray-900">{{ d.name }}</h3>
                        <p class="text-xs text-gray-400 mt-0.5">{{ d.head_name || 'No head assigned' }}</p>
                    </div>
                    <div class="flex gap-1">
                        <button @click="openEdit(d)"
                            class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                        </button>
                        <button @click="confirmDelete(d)"
                            class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t border-gray-50">
                    <span>{{ d.programs_count || 0 }} programs</span>
                    <span>·</span>
                    <span>{{ d.student_profiles_count || 0 }} students</span>
                    <span v-if="d.building" class="ml-auto">{{ d.building }}</span>
                </div>
            </div>
        </div>

        <!-- CREATE/EDIT MODAL -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingDept ? 'Edit Department' :
                            'Add Department' }}</h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6">
                        <input type="text" style="display:none" autocomplete="username" />
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Department Name *</label>
                                <input v-model="form.name" autocomplete="new-password"
                                    placeholder="e.g. Computer Science & Engineering"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Code *</label>
                                <input v-model="form.code" autocomplete="new-password" placeholder="e.g. CSE"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 uppercase" />
                                <p v-if="errors.code" class="text-red-500 text-xs mt-1">{{ errors.code }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Short Name</label>
                                <input v-model="form.short_name" autocomplete="new-password" placeholder="e.g. CSE"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Head of Department</label>
                                <input v-model="form.head_name" autocomplete="new-password" placeholder="Dr. Name"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                <input v-model="form.email" type="text" inputmode="email" autocomplete="new-password"
                                    placeholder="dept@unicore.edu"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                <input v-model="form.phone" autocomplete="new-password" placeholder="+880..."
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Building</label>
                                <input v-model="form.building" autocomplete="new-password" placeholder="Block A"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Room</label>
                                <input v-model="form.room" autocomplete="new-password" placeholder="101"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                <select v-model="form.status"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                <textarea v-model="form.description" rows="2" placeholder="Brief description..."
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 resize-none"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSubmit" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving ? 'Saving...' : (editingDept ? 'Save Changes' : 'Create') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- DELETE MODAL -->
        <Teleport to="body">
            <div v-if="showDeleteModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-red-600">Delete Department</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-gray-600">Delete <strong>{{ deletingDept?.name }}</strong>? This cannot
                            be undone.</p>
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

ui.setPageTitle('Departments')

const departments = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingDept = ref(null)
const deletingDept = ref(null)
const errors = ref({})

const form = reactive({
    name: '', code: '', short_name: '', head_name: '', email: '',
    phone: '', building: '', room: '', description: '', status: 'active',
})

const fetchDepartments = async () => {
    loading.value = true
    try {
        const res = await api.get('/departments', { all: true })
        departments.value = res.data || []
    } finally { loading.value = false }
}

const openCreate = () => {
    editingDept.value = null; errors.value = {}
    Object.assign(form, { name: '', code: '', short_name: '', head_name: '', email: '', phone: '', building: '', room: '', description: '', status: 'active' })
    showModal.value = true
}

const openEdit = (d) => {
    editingDept.value = d; errors.value = {}
    Object.assign(form, { name: d.name, code: d.code, short_name: d.short_name || '', head_name: d.head_name || '', email: d.email || '', phone: d.phone || '', building: d.building || '', room: d.room || '', description: d.description || '', status: d.status })
    showModal.value = true
}

const handleSubmit = async () => {
    errors.value = {}
    if (!form.name) { errors.value.name = 'Required'; return }
    if (!form.code) { errors.value.code = 'Required'; return }
    saving.value = true
    try {
        editingDept.value ? await api.put(`/departments/${editingDept.value.id}`, form) : await api.post('/departments', form)
        toast.add({ title: editingDept.value ? 'Department updated' : 'Department created', color: 'green' })
        showModal.value = false; fetchDepartments()
    } catch (err) {
        const errs = err?.data?.errors || {}
        errors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
    } finally { saving.value = false }
}

const confirmDelete = (d) => { deletingDept.value = d; showDeleteModal.value = true }

const handleDelete = async () => {
    deleting.value = true
    try {
        await api.delete(`/departments/${deletingDept.value.id}`)
        toast.add({ title: 'Department deleted', color: 'green' })
        showDeleteModal.value = false; fetchDepartments()
    } catch (err) {
        toast.add({ title: err?.data?.message || 'Cannot delete', color: 'red' })
    } finally { deleting.value = false }
}

onMounted(fetchDepartments)
</script>