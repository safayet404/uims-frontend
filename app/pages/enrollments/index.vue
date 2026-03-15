<template>
    <div class="space-y-5">

        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Enrollments</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage student course enrollments</p>
            </div>
            <div class="flex gap-2">
                <button v-if="selected.length" @click="bulkApprove"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                    <UIcon name="i-heroicons-check" class="w-4 h-4" /> Approve {{ selected.length }}
                </button>
                <button @click="openCreate"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Enroll Student
                </button>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div v-for="s in statCards" :key="s.label" :class="['bg-white rounded-xl border p-4', s.border]">
                <p :class="['text-2xl font-bold', s.color]">{{ s.value }}</p>
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
                        placeholder="Search student name, ID or course..."
                        class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                </div>
                <select v-model="filters.status" @change="fetchEnrollments"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="dropped">Dropped</option>
                    <option value="completed">Completed</option>
                </select>
                <select v-model="filters.course_id" @change="fetchEnrollments"
                    class="w-52 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Courses</option>
                    <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
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
            <div v-else-if="!enrollments.length" class="p-12 text-center">
                <UIcon name="i-heroicons-pencil-square" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">No enrollments found</p>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="w-10 px-4 py-3">
                            <input type="checkbox" :checked="allSelected" @change="toggleAll"
                                class="rounded border-gray-300" />
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            Course</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Semester</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Section</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Grade</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="e in enrollments" :key="e.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <input type="checkbox" :value="e.id" v-model="selected" :disabled="e.status !== 'pending'"
                                class="rounded border-gray-300 disabled:opacity-30" />
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <img :src="e.student?.avatar_url" :alt="e.student?.name"
                                    class="w-7 h-7 rounded-full object-cover shrink-0" />
                                <div>
                                    <p class="text-sm font-medium text-gray-900">{{ e.student?.name }}</p>
                                    <p class="text-xs font-mono text-gray-400">{{ e.student?.student_id }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <p class="text-sm font-medium text-gray-900">{{ e.course?.code }}</p>
                            <p class="text-xs text-gray-400 truncate max-w-36">{{ e.course?.name }}</p>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <p class="text-xs text-gray-700">{{ e.semester }}</p>
                            <p class="text-xs text-gray-400">{{ e.academic_year }}</p>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-600">{{ e.section || '—' }}</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span v-if="e.grade" :class="['text-sm font-bold', gradeColor(e.grade)]">{{ e.grade_letter
                                }}</span>
                            <span v-else class="text-xs text-gray-400">—</span>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', statusClass(e.status)]">{{
                                    e.status }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <template v-if="e.status === 'pending'">
                                    <button @click="approveOne(e)"
                                        class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                        title="Approve">
                                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                                    </button>
                                    <button @click="openReject(e)"
                                        class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Reject">
                                        <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                                    </button>
                                </template>
                                <button v-if="e.status === 'approved'" @click="dropOne(e)"
                                    class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                    title="Drop">
                                    <UIcon name="i-heroicons-minus-circle" class="w-4 h-4" />
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

        <!-- ENROLL MODAL -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Enroll Student</h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <input type="text" style="display:none" autocomplete="username" />
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Student *</label>
                            <input v-model="enrollForm.studentSearch" @input="searchStudents" type="search"
                                autocomplete="new-password" placeholder="Search student by name or ID..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            <div v-if="studentResults.length"
                                class="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <button v-for="s in studentResults" :key="s.id" @click="selectStudent(s)"
                                    class="w-full flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 text-left border-b border-gray-50 last:border-0">
                                    <img :src="s.avatar_url" class="w-7 h-7 rounded-full object-cover" />
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">{{ s.name }}</p>
                                        <p class="text-xs font-mono text-gray-400">{{ s.student_id }}</p>
                                    </div>
                                </button>
                            </div>
                            <div v-if="enrollForm.student_profile_id"
                                class="mt-2 flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-indigo-600" />
                                <span class="text-sm text-indigo-700">{{ enrollForm.selectedStudentName }}</span>
                                <button @click="clearStudent" class="ml-auto text-gray-400 hover:text-gray-600">
                                    <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Course *</label>
                            <select v-model="enrollForm.course_id"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                <option value="">Select course</option>
                                <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }} ({{
                                    c.enrolled_count }}/{{ c.max_students }})</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Semester *</label>
                                <input v-model="enrollForm.semester" autocomplete="new-password"
                                    placeholder="e.g. Spring 2025"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Academic Year *</label>
                                <input v-model="enrollForm.academic_year" autocomplete="new-password"
                                    placeholder="e.g. 2024-2025"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Section</label>
                                <select v-model="enrollForm.section"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Select</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleEnroll" :disabled="enrolling"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ enrolling ? 'Enrolling...' : 'Enroll' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- REJECT MODAL -->
        <Teleport to="body">
            <div v-if="showRejectModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-red-600">Reject Enrollment</h3>
                    </div>
                    <div class="p-6 space-y-3">
                        <p class="text-sm text-gray-600">Reject enrollment of <strong>{{
                            rejectingEnrollment?.student?.name
                                }}</strong> in <strong>{{ rejectingEnrollment?.course?.code }}</strong>?</p>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Reason (optional)</label>
                            <textarea v-model="rejectReason" rows="2" placeholder="Reason for rejection..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 resize-none"></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showRejectModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleReject" :disabled="rejecting"
                            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                            {{ rejecting ? 'Rejecting...' : 'Reject' }}
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

ui.setPageTitle('Enrollments')

const enrollments = ref([])
const courses = ref([])
const loading = ref(false)
const enrolling = ref(false)
const rejecting = ref(false)
const stats = ref({})
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })
const selected = ref([])

const showModal = ref(false)
const showRejectModal = ref(false)
const rejectingEnrollment = ref(null)
const rejectReason = ref('')

const filters = reactive({ search: '', status: '', course_id: '', page: 1 })
const enrollForm = reactive({ studentSearch: '', student_profile_id: '', selectedStudentName: '', course_id: '', semester: '', academic_year: '', section: '' })
const studentResults = ref([])

const hasFilters = computed(() => filters.search || filters.status || filters.course_id)
const allSelected = computed(() => enrollments.value.filter(e => e.status === 'pending').length > 0 && selected.value.length === enrollments.value.filter(e => e.status === 'pending').length)
const pageNumbers = computed(() => { const p = []; for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) p.push(i); return p })

const statCards = computed(() => [
    { label: 'Total', value: stats.value.total || 0, color: 'text-gray-900', border: 'border-gray-200' },
    { label: 'Pending', value: stats.value.pending || 0, color: 'text-yellow-600', border: 'border-yellow-200' },
    { label: 'Approved', value: stats.value.approved || 0, color: 'text-green-600', border: 'border-green-200' },
    { label: 'Completed', value: stats.value.completed || 0, color: 'text-blue-600', border: 'border-blue-200' },
    { label: 'Dropped', value: stats.value.dropped || 0, color: 'text-red-600', border: 'border-red-200' },
])

const statusClass = (s) => ({
    pending: 'text-yellow-700 bg-yellow-50',
    approved: 'text-green-700 bg-green-50',
    rejected: 'text-red-700 bg-red-50',
    dropped: 'text-gray-600 bg-gray-100',
    completed: 'text-blue-700 bg-blue-50',
}[s] || 'text-gray-600 bg-gray-100')

const gradeColor = (g) => g >= 3.5 ? 'text-green-600' : g >= 3.0 ? 'text-blue-600' : g >= 2.5 ? 'text-yellow-600' : 'text-red-600'

let searchTimer = null
const debouncedFetch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchEnrollments, 400) }

const fetchEnrollments = async () => {
    loading.value = true
    try {
        const res = await api.get('/enrollments', { search: filters.search || undefined, status: filters.status || undefined, course_id: filters.course_id || undefined, page: filters.page })
        enrollments.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => { try { const r = await api.get('/enrollments/stats'); stats.value = r.data || {} } catch { } }
const fetchCourses = async () => { try { const r = await api.get('/courses', { all: true }); courses.value = r.data || [] } catch { } }

const changePage = (p) => { filters.page = p; fetchEnrollments() }
const clearFilters = () => { Object.assign(filters, { search: '', status: '', course_id: '', page: 1 }); fetchEnrollments() }
const toggleAll = (e) => { selected.value = e.target.checked ? enrollments.value.filter(en => en.status === 'pending').map(en => en.id) : [] }

let stuTimer = null
const searchStudents = () => {
    clearTimeout(stuTimer)
    stuTimer = setTimeout(async () => {
        if (!enrollForm.studentSearch || enrollForm.studentSearch.length < 2) { studentResults.value = []; return }
        try {
            const res = await api.get('/students', { search: enrollForm.studentSearch, per_page: 5 })
            studentResults.value = res.data || []
        } catch { }
    }, 300)
}

const selectStudent = (s) => {
    enrollForm.student_profile_id = s.id
    enrollForm.selectedStudentName = `${s.name} (${s.student_id})`
    enrollForm.studentSearch = ''
    studentResults.value = []
}

const clearStudent = () => { enrollForm.student_profile_id = ''; enrollForm.selectedStudentName = '' }

const openCreate = () => {
    Object.assign(enrollForm, { studentSearch: '', student_profile_id: '', selectedStudentName: '', course_id: '', semester: '', academic_year: '', section: '' })
    studentResults.value = []
    showModal.value = true
}

const handleEnroll = async () => {
    if (!enrollForm.student_profile_id || !enrollForm.course_id || !enrollForm.semester || !enrollForm.academic_year) {
        toast.add({ title: 'Please fill all required fields', color: 'red' }); return
    }
    enrolling.value = true
    try {
        await api.post('/enrollments', { student_profile_id: enrollForm.student_profile_id, course_id: enrollForm.course_id, semester: enrollForm.semester, academic_year: enrollForm.academic_year, section: enrollForm.section })
        toast.add({ title: 'Student enrolled', color: 'green' })
        showModal.value = false; fetchEnrollments(); fetchStats()
    } catch (err) {
        toast.add({ title: err?.data?.message || 'Enrollment failed', color: 'red' })
    } finally { enrolling.value = false }
}

const approveOne = async (e) => {
    try {
        await api.patch(`/enrollments/${e.id}/approve`)
        toast.add({ title: 'Enrollment approved', color: 'green' })
        fetchEnrollments(); fetchStats()
    } catch { }
}

const bulkApprove = async () => {
    try {
        await api.post('/enrollments/bulk-approve', { enrollment_ids: selected.value })
        toast.add({ title: `${selected.value.length} enrollments approved`, color: 'green' })
        selected.value = []; fetchEnrollments(); fetchStats()
    } catch { }
}

const openReject = (e) => { rejectingEnrollment.value = e; rejectReason.value = ''; showRejectModal.value = true }

const handleReject = async () => {
    rejecting.value = true
    try {
        await api.patch(`/enrollments/${rejectingEnrollment.value.id}/reject`, { reason: rejectReason.value })
        toast.add({ title: 'Enrollment rejected', color: 'green' })
        showRejectModal.value = false; fetchEnrollments(); fetchStats()
    } finally { rejecting.value = false }
}

const dropOne = async (e) => {
    if (!confirm(`Drop ${e.student?.name} from ${e.course?.code}?`)) return
    try {
        await api.patch(`/enrollments/${e.id}/drop`)
        toast.add({ title: 'Enrollment dropped', color: 'green' })
        fetchEnrollments(); fetchStats()
    } catch { }
}

onMounted(async () => {
    await Promise.all([fetchEnrollments(), fetchStats(), fetchCourses()])
})
</script>