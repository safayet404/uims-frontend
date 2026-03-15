<template>
    <div class="space-y-5">

        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Courses</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage academic courses and faculty assignments</p>
            </div>
            <button @click="openCreate"
                class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Course
            </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div v-for="s in statCards" :key="s.label" class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-gray-900">{{ s.value }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ s.label }}</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex flex-wrap gap-3">
                <div class="flex-1 min-w-48 relative">
                    <UIcon name="i-heroicons-magnifying-glass"
                        class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input v-model="filters.search" @input="debouncedFetch" type="search" autocomplete="new-password"
                        placeholder="Search course name or code..."
                        class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                </div>
                <select v-model="filters.department_id" @change="fetchCourses"
                    class="w-44 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Departments</option>
                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }}</option>
                </select>
                <select v-model="filters.course_type" @change="fetchCourses"
                    class="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Types</option>
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="project">Project</option>
                    <option value="thesis">Thesis</option>
                </select>
                <select v-model="filters.status" @change="fetchCourses"
                    class="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                </select>
                <button v-if="hasFilters" @click="clearFilters"
                    class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</button>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <div v-else-if="!courses.length" class="p-12 text-center">
                <UIcon name="i-heroicons-clipboard-document-list" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 mb-3">No courses found</p>
                <button @click="openCreate"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add
                    Course</button>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            Dept</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Faculty</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Credits</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Enrolled</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Semester</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="c in courses" :key="c.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <p class="text-sm font-semibold text-gray-900">{{ c.name }}</p>
                            <p class="text-xs font-mono text-indigo-600">{{ c.code }}</p>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <span class="text-xs font-medium text-gray-700">{{ c.department?.code || '—' }}</span>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <div v-if="c.faculty">
                                <p class="text-xs font-medium text-gray-900 truncate max-w-32">{{ c.faculty.name }}</p>
                                <p class="text-xs text-gray-400">{{ c.faculty.designation }}</p>
                            </div>
                            <span v-else class="text-xs text-gray-400">Unassigned</span>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <span class="text-sm font-bold text-gray-900">{{ c.credit_hours }}</span>
                            <span class="text-xs text-gray-400"> cr</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <div class="flex items-center gap-1">
                                <div class="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                                    <div :style="`width:${Math.min(100, (c.enrolled_count / c.max_students) * 100)}%`"
                                        :class="['h-1.5 rounded-full', c.enrolled_count >= c.max_students ? 'bg-red-500' : 'bg-indigo-500']" />
                                </div>
                                <span class="text-xs text-gray-500">{{ c.enrolled_count }}/{{ c.max_students }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-600">{{ c.semester_level || '—' }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', typeColor(c.course_type)]">{{
                                    c.course_type }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button @click="openEdit(c)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                </button>
                                <button @click="confirmDelete(c)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="pagination.last_page > 1"
                class="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
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

        <!-- CREATE/EDIT MODAL -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingCourse ? 'Edit Course' : 'Add Course'
                        }}</h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6">
                        <input type="text" style="display:none" autocomplete="username" />
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Course Name *</label>
                                <input v-model="form.name" autocomplete="new-password"
                                    placeholder="e.g. Introduction to Programming"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Course Code *</label>
                                <input v-model="form.code" autocomplete="new-password" placeholder="e.g. CSE301"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 uppercase" />
                                <p v-if="errors.code" class="text-red-500 text-xs mt-1">{{ errors.code }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Department *</label>
                                <select v-model="form.department_id" @change="loadDeptFaculty"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Select department</option>
                                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} — {{ d.name
                                    }}</option>
                                </select>
                                <p v-if="errors.department_id" class="text-red-500 text-xs mt-1">{{ errors.department_id
                                }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Assign Faculty</label>
                                <select v-model="form.faculty_profile_id"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Unassigned</option>
                                    <option v-for="f in deptFaculty" :key="f.id" :value="f.id">{{ f.user?.name }} ({{
                                        f.designation }})</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Program</label>
                                <select v-model="form.program_id"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">All Programs</option>
                                    <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.code }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Course Type</label>
                                <select v-model="form.course_type"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="theory">Theory</option>
                                    <option value="lab">Lab</option>
                                    <option value="project">Project</option>
                                    <option value="thesis">Thesis</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Credit Hours</label>
                                <input v-model="form.credit_hours" type="number" min="1" max="6"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Max Students</label>
                                <input v-model="form.max_students" type="number" min="1"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Semester Level</label>
                                <select v-model="form.semester_level"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Select</option>
                                    <option v-for="s in semesters" :key="s" :value="s">{{ s }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                <select v-model="form.status"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div class="col-span-2">
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
                            {{ saving ? 'Saving...' : (editingCourse ? 'Save Changes' : 'Create Course') }}
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
                        <h3 class="text-lg font-semibold text-red-600">Delete Course</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-gray-600">Delete <strong>{{ deletingCourse?.name }}</strong> ({{
                            deletingCourse?.code }})?</p>
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

ui.setPageTitle('Courses')

const courses = ref([])
const departments = ref([])
const programs = ref([])
const allFaculty = ref([])
const deptFaculty = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const stats = ref({})
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingCourse = ref(null)
const deletingCourse = ref(null)
const errors = ref({})

const filters = reactive({ search: '', department_id: '', course_type: '', status: '', page: 1 })
const form = reactive({ name: '', code: '', department_id: '', program_id: '', faculty_profile_id: '', course_type: 'theory', credit_hours: 3, contact_hours: 3, max_students: 50, semester_level: '', status: 'active', description: '' })

const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

const hasFilters = computed(() => filters.search || filters.department_id || filters.course_type || filters.status)
const pageNumbers = computed(() => { const p = []; for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) p.push(i); return p })
const statCards = computed(() => [
    { label: 'Total Courses', value: stats.value.total || 0 },
    { label: 'Active', value: stats.value.active || 0 },
    { label: 'Theory', value: stats.value.theory || 0 },
    { label: 'Lab', value: stats.value.lab || 0 },
])

const typeColor = (t) => ({
    theory: 'text-blue-700 bg-blue-50',
    lab: 'text-green-700 bg-green-50',
    project: 'text-purple-700 bg-purple-50',
    thesis: 'text-amber-700 bg-amber-50',
}[t] || 'text-gray-700 bg-gray-100')

let searchTimer = null
const debouncedFetch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchCourses, 400) }

const fetchCourses = async () => {
    loading.value = true
    try {
        const res = await api.get('/courses', { search: filters.search || undefined, department_id: filters.department_id || undefined, course_type: filters.course_type || undefined, status: filters.status || undefined, page: filters.page })
        courses.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => { try { const r = await api.get('/courses/stats'); stats.value = r.data || {} } catch { } }

const fetchDepartments = async () => { try { const r = await api.get('/departments', { all: true }); departments.value = r.data || [] } catch { } }
const fetchPrograms = async () => { try { const r = await api.get('/programs', { all: true }); programs.value = r.data || [] } catch { } }
const fetchAllFaculty = async () => { try { const r = await api.get('/faculty', { per_page: 200 }); allFaculty.value = r.data || [] } catch { } }

const loadDeptFaculty = () => {
    deptFaculty.value = form.department_id
        ? allFaculty.value.filter(f => f.department?.id == form.department_id)
        : allFaculty.value
    form.faculty_profile_id = ''
}

const changePage = (p) => { filters.page = p; fetchCourses() }
const clearFilters = () => { Object.assign(filters, { search: '', department_id: '', course_type: '', status: '', page: 1 }); fetchCourses() }

const openCreate = () => {
    editingCourse.value = null; errors.value = {}
    Object.assign(form, { name: '', code: '', department_id: '', program_id: '', faculty_profile_id: '', course_type: 'theory', credit_hours: 3, contact_hours: 3, max_students: 50, semester_level: '', status: 'active', description: '' })
    deptFaculty.value = allFaculty.value
    showModal.value = true
}

const openEdit = (c) => {
    editingCourse.value = c; errors.value = {}
    Object.assign(form, { name: c.name, code: c.code, department_id: c.department?.id || '', program_id: c.program?.id || '', faculty_profile_id: c.faculty_profile_id || '', course_type: c.course_type, credit_hours: c.credit_hours, contact_hours: c.contact_hours, max_students: c.max_students, semester_level: c.semester_level || '', status: c.status, description: c.description || '' })
    deptFaculty.value = form.department_id ? allFaculty.value.filter(f => f.department?.id == form.department_id) : allFaculty.value
    showModal.value = true
}

const handleSubmit = async () => {
    errors.value = {}
    if (!form.name) { errors.value.name = 'Required'; return }
    if (!form.code) { errors.value.code = 'Required'; return }
    if (!form.department_id) { errors.value.department_id = 'Required'; return }
    saving.value = true
    try {
        editingCourse.value ? await api.put(`/courses/${editingCourse.value.id}`, form) : await api.post('/courses', form)
        toast.add({ title: editingCourse.value ? 'Course updated' : 'Course created', color: 'green' })
        showModal.value = false; fetchCourses(); fetchStats()
    } catch (err) {
        const errs = err?.data?.errors || {}
        errors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
    } finally { saving.value = false }
}

const confirmDelete = (c) => { deletingCourse.value = c; showDeleteModal.value = true }

const handleDelete = async () => {
    deleting.value = true
    try {
        await api.delete(`/courses/${deletingCourse.value.id}`)
        toast.add({ title: 'Course deleted', color: 'green' })
        showDeleteModal.value = false; fetchCourses(); fetchStats()
    } catch (err) {
        toast.add({ title: err?.data?.message || 'Cannot delete', color: 'red' })
    } finally { deleting.value = false }
}

onMounted(async () => {
    await Promise.all([fetchCourses(), fetchStats(), fetchDepartments(), fetchPrograms(), fetchAllFaculty()])
})
</script>