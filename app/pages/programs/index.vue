<template>
    <div class="space-y-5">

        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Programs</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage academic programs and degrees</p>
            </div>
            <button @click="openCreate"
                class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Program
            </button>
        </div>

        <!-- Filter by dept -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex gap-3">
                <select v-model="filterDept" @change="fetchPrograms"
                    class="w-56 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Departments</option>
                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} — {{ d.name }}</option>
                </select>
                <select v-model="filterDegree" @change="fetchPrograms"
                    class="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Degrees</option>
                    <option value="bachelor">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="diploma">Diploma</option>
                    <option value="phd">PhD</option>
                </select>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Program</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            Department</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Degree</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Duration</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Credits</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Students</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="p in programs" :key="p.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <p class="text-sm font-semibold text-gray-900">{{ p.name }}</p>
                            <p class="text-xs font-mono text-indigo-600">{{ p.code }}</p>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <span class="text-xs font-medium text-gray-700">{{ p.department?.code }}</span>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', degreeColor(p.degree_type)]">{{
                                    p.degree_type }}</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-600">{{ p.duration_years }} years</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-600">{{ p.total_credits }} credits</span>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <span class="text-xs text-gray-600">{{ p.student_profiles_count || 0 }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', p.status === 'active' ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100']">{{
                                    p.status }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button @click="openEdit(p)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                </button>
                                <button @click="confirmDelete(p)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!programs.length">
                        <td colspan="8" class="px-4 py-12 text-center text-gray-400 text-sm">No programs found</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- CREATE/EDIT MODAL -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingProgram ? 'Edit Program' :
                            'Add Program' }}</h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Program Name *</label>
                                <input v-model="form.name" autocomplete="new-password"
                                    placeholder="e.g. B.Sc. in Computer Science"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Code *</label>
                                    <input v-model="form.code" autocomplete="new-password" placeholder="e.g. BSCSE"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 uppercase" />
                                    <p v-if="errors.code" class="text-red-500 text-xs mt-1">{{ errors.code }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Dept Code
                                        (numeric)</label>
                                    <input v-model="form.dept_code" type="number" autocomplete="new-password"
                                        placeholder="006"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Department *</label>
                                    <select v-model="form.department_id"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select department</option>
                                        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} — {{
                                            d.name }}</option>
                                    </select>
                                    <p v-if="errors.department_id" class="text-red-500 text-xs mt-1">{{
                                        errors.department_id }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Degree Type *</label>
                                    <select v-model="form.degree_type"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="bachelor">Bachelor</option>
                                        <option value="master">Master</option>
                                        <option value="diploma">Diploma</option>
                                        <option value="phd">PhD</option>
                                        <option value="certificate">Certificate</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Duration (years)</label>
                                    <input v-model="form.duration_years" type="number" min="1" max="10"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Total Credits</label>
                                    <input v-model="form.total_credits" type="number"
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
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                <textarea v-model="form.description" rows="2" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 resize-none"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSubmit" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving ? 'Saving...' : (editingProgram ? 'Save Changes' : 'Create') }}
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
                        <h3 class="text-lg font-semibold text-red-600">Delete Program</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-gray-600">Delete <strong>{{ deletingProgram?.name }}</strong>?</p>
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

ui.setPageTitle('Programs')

const programs = ref([])
const departments = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const filterDept = ref('')
const filterDegree = ref('')

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingProgram = ref(null)
const deletingProgram = ref(null)
const errors = ref({})

const form = reactive({
    name: '', code: '', department_id: '', degree_type: 'bachelor',
    duration_years: 4, total_credits: 120, dept_code: '',
    description: '', status: 'active',
})

const degreeColor = (d) => ({
    bachelor: 'text-blue-700 bg-blue-50',
    master: 'text-purple-700 bg-purple-50',
    diploma: 'text-green-700 bg-green-50',
    phd: 'text-red-700 bg-red-50',
    certificate: 'text-gray-700 bg-gray-100',
}[d] || 'text-gray-700 bg-gray-100')

const fetchPrograms = async () => {
    loading.value = true
    try {
        const res = await api.get('/programs', {
            all: true,
            department_id: filterDept.value || undefined,
            degree_type: filterDegree.value || undefined,
        })
        programs.value = res.data || []
    } finally { loading.value = false }
}

const fetchDepartments = async () => {
    try { const res = await api.get('/departments', { all: true }); departments.value = res.data || [] } catch { }
}

const openCreate = () => {
    editingProgram.value = null; errors.value = {}
    Object.assign(form, { name: '', code: '', department_id: '', degree_type: 'bachelor', duration_years: 4, total_credits: 120, dept_code: '', description: '', status: 'active' })
    showModal.value = true
}

const openEdit = (p) => {
    editingProgram.value = p; errors.value = {}
    Object.assign(form, { name: p.name, code: p.code, department_id: p.department_id, degree_type: p.degree_type, duration_years: p.duration_years, total_credits: p.total_credits, dept_code: p.dept_code || '', description: p.description || '', status: p.status })
    showModal.value = true
}

const handleSubmit = async () => {
    errors.value = {}
    if (!form.name) { errors.value.name = 'Required'; return }
    if (!form.code) { errors.value.code = 'Required'; return }
    if (!form.department_id) { errors.value.department_id = 'Required'; return }
    saving.value = true
    try {
        editingProgram.value ? await api.put(`/programs/${editingProgram.value.id}`, form) : await api.post('/programs', form)
        toast.add({ title: editingProgram.value ? 'Program updated' : 'Program created', color: 'green' })
        showModal.value = false; fetchPrograms()
    } catch (err) {
        const errs = err?.data?.errors || {}
        errors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
    } finally { saving.value = false }
}

const confirmDelete = (p) => { deletingProgram.value = p; showDeleteModal.value = true }

const handleDelete = async () => {
    deleting.value = true
    try {
        await api.delete(`/programs/${deletingProgram.value.id}`)
        toast.add({ title: 'Program deleted', color: 'green' })
        showDeleteModal.value = false; fetchPrograms()
    } catch (err) {
        toast.add({ title: err?.data?.message || 'Cannot delete', color: 'red' })
    } finally { deleting.value = false }
}

onMounted(async () => {
    await Promise.all([fetchPrograms(), fetchDepartments()])
})
</script>