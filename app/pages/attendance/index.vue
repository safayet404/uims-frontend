<template>
    <div class="space-y-5">

        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Attendance</h2>
                <p class="text-sm text-gray-500 mt-0.5">Mark and manage student attendance</p>
            </div>
            <div class="flex gap-2">
                <NuxtLink to="/attendance/report"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" /> Reports
                </NuxtLink>
                <button @click="showMarkModal = true"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Mark Attendance
                </button>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.total_sessions || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Total Sessions</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-indigo-600">{{ stats.today_sessions || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Today's Sessions</p>
            </div>
            <div class="bg-green-50 rounded-xl border border-green-200 p-4">
                <p class="text-2xl font-bold text-green-600">{{ stats.present_today || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Present Today</p>
            </div>
            <div class="bg-red-50 rounded-xl border border-red-200 p-4">
                <p class="text-2xl font-bold text-red-600">{{ stats.absent_today || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Absent Today</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex flex-wrap gap-3">
                <select v-model="filters.course_id" @change="fetchSessions"
                    class="w-56 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Courses</option>
                    <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
                </select>
                <input v-model="filters.date_from" @change="fetchSessions" type="date"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700" />
                <input v-model="filters.date_to" @change="fetchSessions" type="date"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700" />
                <button v-if="filters.course_id || filters.date_from" @click="clearFilters"
                    class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</button>
            </div>
        </div>

        <!-- Sessions table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <div v-else-if="!sessions.length" class="p-12 text-center">
                <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 mb-3">No attendance sessions yet</p>
                <button @click="showMarkModal = true"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Mark
                    First Attendance</button>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            Course</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Topic</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Students</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Taken By</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="s in sessions" :key="s.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <p class="text-sm font-semibold text-gray-900">{{ s.date_display }}</p>
                            <p class="text-xs text-gray-400">{{ s.semester }}</p>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <p class="text-sm font-medium text-gray-900">{{ s.course?.code }}</p>
                            <p class="text-xs text-gray-400 truncate max-w-32">{{ s.course?.name }}</p>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <p class="text-xs text-gray-600 truncate max-w-36">{{ s.topic || '—' }}</p>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <span class="text-sm font-medium text-gray-900">{{ s.records_count }}</span>
                            <span class="text-xs text-gray-400"> students</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-600">{{ s.taken_by }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', s.is_finalized ? 'text-green-700 bg-green-50' : 'text-yellow-700 bg-yellow-50']">
                                {{ s.is_finalized ? 'Finalized' : 'Draft' }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <button @click="editSession(s)"
                                class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                            </button>
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

        <!-- ── MARK ATTENDANCE MODAL ── -->
        <Teleport to="body">
            <div v-if="showMarkModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                    @click.stop>

                    <!-- Header -->
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                        <h3 class="text-lg font-semibold text-gray-900">Mark Attendance</h3>
                        <button @click="closeMarkModal"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Session setup -->
                    <div class="px-6 py-4 border-b border-gray-100 shrink-0 bg-gray-50">
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Course *</label>
                                <select v-model="markForm.course_id" @change="loadStudents"
                                    class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Select course</option>
                                    <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Date *</label>
                                <input v-model="markForm.date" @change="loadStudents" type="date"
                                    class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Semester *</label>
                                <input v-model="markForm.semester" autocomplete="new-password" placeholder="Spring 2025"
                                    class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Academic Year *</label>
                                <input v-model="markForm.academic_year" autocomplete="new-password"
                                    placeholder="2024-2025"
                                    class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                        </div>
                        <div class="mt-3">
                            <label class="block text-xs font-medium text-gray-600 mb-1">Topic (optional)</label>
                            <input v-model="markForm.topic" autocomplete="new-password"
                                placeholder="Today's class topic..."
                                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                    </div>

                    <!-- Students list -->
                    <div class="flex-1 overflow-y-auto">
                        <div v-if="loadingStudents" class="p-8 text-center">
                            <div
                                class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                            </div>
                        </div>
                        <div v-else-if="!markStudents.length" class="p-8 text-center text-gray-400 text-sm">
                            {{ markForm.course_id ? 'No enrolled students found for this semester.' :
                                'Select a course and date to load students.' }}
                        </div>
                        <div v-else>
                            <!-- Quick actions -->
                            <div class="flex items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100">
                                <span class="text-sm text-gray-600 font-medium">{{ markStudents.length }}
                                    students</span>
                                <div class="flex gap-2 ml-auto">
                                    <button @click="markAll('present')"
                                        class="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200">All
                                        Present</button>
                                    <button @click="markAll('absent')"
                                        class="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200">All
                                        Absent</button>
                                </div>
                                <div class="flex gap-3 text-xs text-gray-500">
                                    <span class="text-green-600 font-medium">Present: {{ presentCount }}</span>
                                    <span class="text-red-600 font-medium">Absent: {{ absentCount }}</span>
                                    <span class="text-yellow-600 font-medium">Late: {{ lateCount }}</span>
                                </div>
                            </div>

                            <div class="divide-y divide-gray-50">
                                <div v-for="(student, idx) in markStudents" :key="student.student_profile_id"
                                    :class="['flex items-center gap-3 px-6 py-3', student.status === 'present' ? 'bg-green-50/30' : student.status === 'absent' ? 'bg-red-50/30' : student.status === 'late' ? 'bg-yellow-50/30' : '']">
                                    <span class="text-xs text-gray-400 w-6 text-right">{{ idx + 1 }}</span>
                                    <img :src="student.avatar_url" :alt="student.name"
                                        class="w-8 h-8 rounded-full object-cover shrink-0" />
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate">{{ student.name }}</p>
                                        <p class="text-xs font-mono text-gray-400">{{ student.student_id }}</p>
                                    </div>
                                    <!-- Status buttons -->
                                    <div class="flex gap-1">
                                        <button @click="setStatus(student, 'present')"
                                            :class="['px-2.5 py-1 text-xs font-medium rounded-lg transition-colors', student.status === 'present' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-50']">P</button>
                                        <button @click="setStatus(student, 'absent')"
                                            :class="['px-2.5 py-1 text-xs font-medium rounded-lg transition-colors', student.status === 'absent' ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50']">A</button>
                                        <button @click="setStatus(student, 'late')"
                                            :class="['px-2.5 py-1 text-xs font-medium rounded-lg transition-colors', student.status === 'late' ? 'bg-yellow-500 text-white' : 'text-yellow-600 hover:bg-yellow-50']">L</button>
                                        <button @click="setStatus(student, 'excused')"
                                            :class="['px-2.5 py-1 text-xs font-medium rounded-lg transition-colors', student.status === 'excused' ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-blue-50']">E</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div v-if="markStudents.length"
                        class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
                        <button @click="closeMarkModal"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="saveAttendance(false)" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                            {{ saving ? 'Saving...' : 'Save Draft' }}
                        </button>
                        <button @click="saveAttendance(true)" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving ? 'Saving...' : 'Save & Finalize' }}
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

ui.setPageTitle('Attendance')

const sessions = ref([])
const courses = ref([])
const stats = ref({})
const loading = ref(false)
const saving = ref(false)
const loadingStudents = ref(false)
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })

const showMarkModal = ref(false)
const markStudents = ref([])

const filters = reactive({ course_id: '', date_from: '', date_to: '', page: 1 })
const markForm = reactive({ course_id: '', date: new Date().toISOString().slice(0, 10), semester: 'Spring 2025', academic_year: '2024-2025', topic: '', section: '' })

const pageNumbers = computed(() => { const p = []; for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) p.push(i); return p })

const presentCount = computed(() => markStudents.value.filter(s => s.status === 'present').length)
const absentCount = computed(() => markStudents.value.filter(s => s.status === 'absent').length)
const lateCount = computed(() => markStudents.value.filter(s => s.status === 'late').length)

const fetchSessions = async () => {
    loading.value = true
    try {
        const res = await api.get('/attendance/sessions', {
            course_id: filters.course_id || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
            page: filters.page,
        })
        sessions.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => { try { const r = await api.get('/attendance/stats'); stats.value = r.data || {} } catch { } }
const fetchCourses = async () => { try { const r = await api.get('/courses', { all: true }); courses.value = r.data || [] } catch { } }

const changePage = (p) => { filters.page = p; fetchSessions() }
const clearFilters = () => { Object.assign(filters, { course_id: '', date_from: '', date_to: '', page: 1 }); fetchSessions() }

const loadStudents = async () => {
    if (!markForm.course_id || !markForm.date || !markForm.semester || !markForm.academic_year) return
    loadingStudents.value = true
    try {
        const res = await api.get('/attendance/students', {
            course_id: markForm.course_id,
            date: markForm.date,
            semester: markForm.semester,
            academic_year: markForm.academic_year,
        })
        markStudents.value = res.students || []
    } finally { loadingStudents.value = false }
}

const setStatus = (student, status) => { student.status = status }
const markAll = (status) => { markStudents.value.forEach(s => s.status = status) }

const saveAttendance = async (finalize) => {
    if (!markForm.course_id || !markForm.date) { toast.add({ title: 'Select course and date', color: 'red' }); return }
    saving.value = true
    try {
        const res = await api.post('/attendance/mark', {
            course_id: markForm.course_id,
            date: markForm.date,
            semester: markForm.semester,
            academic_year: markForm.academic_year,
            topic: markForm.topic || undefined,
            finalize: finalize,
            records: markStudents.value.map(s => ({
                student_profile_id: s.student_profile_id,
                status: s.status,
                remarks: s.remarks || undefined,
            })),
        })
        const { summary } = res
        toast.add({ title: finalize ? 'Attendance finalized' : 'Attendance saved', description: `Present: ${summary.present}, Absent: ${summary.absent}, Late: ${summary.late}`, color: 'green' })
        closeMarkModal()
        fetchSessions()
        fetchStats()
    } finally { saving.value = false }
}

const editSession = async (session) => {
    markForm.course_id = session.course?.id
    markForm.date = session.date
    markForm.semester = session.semester
    markForm.academic_year = session.academic_year
    showMarkModal.value = true
    await loadStudents()
}

const closeMarkModal = () => {
    showMarkModal.value = false
    markStudents.value = []
    markForm.topic = ''
}

onMounted(async () => {
    await Promise.all([fetchSessions(), fetchStats(), fetchCourses()])
})
</script>