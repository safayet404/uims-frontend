<template>
    <div class="space-y-5">

        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Exams</h2>
                <p class="text-sm text-gray-500 mt-0.5">Schedule and manage examinations</p>
            </div>
            <button @click="openCreate"
                class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Schedule Exam
            </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div v-for="s in statCards" :key="s.label"
                :class="['bg-white rounded-xl border p-4', s.border || 'border-gray-200']">
                <p :class="['text-2xl font-bold', s.color || 'text-gray-900']">{{ s.value }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ s.label }}</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex flex-wrap gap-3">
                <select v-model="filters.course_id" @change="fetchExams"
                    class="w-52 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Courses</option>
                    <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
                </select>
                <select v-model="filters.exam_type" @change="fetchExams"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Types</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="lab">Lab</option>
                    <option value="viva">Viva</option>
                </select>
                <select v-model="filters.status" @change="fetchExams"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <button v-if="filters.course_id || filters.exam_type || filters.status" @click="clearFilters"
                    class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</button>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <div v-else-if="!exams.length" class="p-12 text-center">
                <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 mb-3">No exams scheduled</p>
                <button @click="openCreate"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Schedule
                    Exam</button>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Exam</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            Course</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Date</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Marks</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Venue</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="e in exams" :key="e.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <p class="text-sm font-semibold text-gray-900">{{ e.title }}</p>
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', typeColor(e.exam_type)]">{{
                                    e.exam_type }}</span>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <p class="text-xs font-medium text-gray-900">{{ e.course?.code }}</p>
                            <p class="text-xs text-gray-400">{{ e.course?.department }}</p>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <p class="text-xs font-medium text-gray-900">{{ e.exam_date_display || 'TBD' }}</p>
                            <p v-if="e.start_time" class="text-xs text-gray-400">{{ e.start_time }} – {{ e.end_time }}
                            </p>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <p class="text-sm font-bold text-gray-900">{{ e.total_marks }}</p>
                            <p class="text-xs text-gray-400">Pass: {{ e.passing_marks }}</p>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-600">{{ e.venue || '—' }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="space-y-1">
                                <span
                                    :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', statusColor(e.status)]">{{
                                        e.status }}</span>
                                <div v-if="e.results_published" class="flex items-center gap-1">
                                    <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span class="text-xs text-green-600">Published</span>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button @click="openResults(e)"
                                    class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                    title="Enter Results">
                                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                </button>
                                <button @click="openEdit(e)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    title="Edit">
                                    <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
                                </button>
                                <button @click="confirmDelete(e)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Delete">
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
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingExam ? 'Edit Exam' : 'Schedule Exam'
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
                                <label class="block text-xs font-medium text-gray-600 mb-1">Exam Title *</label>
                                <input v-model="form.title" autocomplete="new-password" placeholder="e.g. Midterm Exam"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <p v-if="errors.title" class="text-red-500 text-xs mt-1">{{ errors.title }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Course *</label>
                                <select v-model="form.course_id" :disabled="!!editingExam"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 disabled:bg-gray-50">
                                    <option value="">Select course</option>
                                    <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}
                                    </option>
                                </select>
                                <p v-if="errors.course_id" class="text-red-500 text-xs mt-1">{{ errors.course_id }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Exam Type *</label>
                                <select v-model="form.exam_type"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="midterm">Midterm</option>
                                    <option value="final">Final</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="assignment">Assignment</option>
                                    <option value="lab">Lab</option>
                                    <option value="viva">Viva</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Semester *</label>
                                <input v-model="form.semester" autocomplete="new-password" placeholder="Spring 2025"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Academic Year *</label>
                                <input v-model="form.academic_year" autocomplete="new-password" placeholder="2024-2025"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Exam Date</label>
                                <input v-model="form.exam_date" type="date" placeholder="YYYY-MM-DD"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                <pre>{{ form.exam_date }}</pre>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Venue</label>
                                <input v-model="form.venue" autocomplete="new-password" placeholder="Exam Hall 1"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                                <input v-model="form.start_time" type="time" placeholder="09:00"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                                <input v-model="form.end_time" type="time" placeholder="11:00"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Total Marks</label>
                                <input v-model="form.total_marks" type="number" min="1"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Passing Marks</label>
                                <input v-model="form.passing_marks" type="number" min="0"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Weightage (%)</label>
                                <input v-model="form.weightage" type="number" min="0" max="100" step="0.5"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div v-if="editingExam">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                <select v-model="form.status"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="scheduled">Scheduled</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSubmit" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving ? 'Saving...' : (editingExam ? 'Save Changes' : 'Schedule') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ENTER RESULTS MODAL -->
        <Teleport to="body">
            <div v-if="showResultsModal && activeExam"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">Enter Results — {{ activeExam.title }}</h3>
                            <p class="text-xs text-gray-400 mt-0.5">{{ activeExam.course?.code }} · Total: {{
                                activeExam.total_marks }} marks</p>
                        </div>
                        <button @click="showResultsModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>

                    <div v-if="loadingResults" class="p-8 text-center flex-1">
                        <div
                            class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                        </div>
                    </div>
                    <div v-else class="flex-1 overflow-y-auto">
                        <div
                            class="flex items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                            <span class="w-8">#</span>
                            <span class="flex-1">Student</span>
                            <span class="w-28 text-center">Marks (/ {{ activeExam.total_marks }})</span>
                            <span class="w-16 text-center">Grade</span>
                            <span class="w-16 text-center">Absent</span>
                        </div>
                        <div class="divide-y divide-gray-50">
                            <div v-for="(s, idx) in resultStudents" :key="s.student_profile_id"
                                :class="['flex items-center gap-3 px-6 py-3', s.is_absent ? 'bg-red-50/30' : '']">
                                <span class="text-xs text-gray-400 w-8">{{ idx + 1 }}</span>
                                <div class="flex items-center gap-2 flex-1 min-w-0">
                                    <img :src="s.avatar_url" :alt="s.name"
                                        class="w-7 h-7 rounded-full object-cover shrink-0" />
                                    <div class="min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate">{{ s.name }}</p>
                                        <p class="text-xs font-mono text-gray-400">{{ s.student_id }}</p>
                                    </div>
                                </div>
                                <div class="w-28">
                                    <input v-model="s.marks_obtained" type="number" :min="0"
                                        :max="activeExam.total_marks" step="0.5" :disabled="s.is_absent"
                                        @input="calcGrade(s)"
                                        class="w-full px-2 py-1.5 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400" />
                                </div>
                                <div class="w-16 text-center">
                                    <span v-if="s.grade_letter && !s.is_absent"
                                        :class="['text-sm font-bold', gradeColor(s.grade_point)]">{{ s.grade_letter
                                        }}</span>
                                    <span v-else-if="s.is_absent" class="text-xs text-red-500">Absent</span>
                                    <span v-else class="text-xs text-gray-300">—</span>
                                </div>
                                <div class="w-16 text-center">
                                    <input type="checkbox" v-model="s.is_absent"
                                        @change="() => { if (s.is_absent) { s.marks_obtained = null; s.grade_letter = null; s.grade_point = null; } }"
                                        class="w-4 h-4 rounded border-gray-300 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center px-6 py-4 border-t border-gray-100 shrink-0">
                        <div class="text-xs text-gray-500">
                            Present: <span class="font-medium text-green-600">{{resultStudents.filter(s =>
                                !s.is_absent).length}}</span> ·
                            Absent: <span class="font-medium text-red-600">{{resultStudents.filter(s =>
                                s.is_absent).length}}</span>
                        </div>
                        <div class="flex gap-2">
                            <button @click="showResultsModal = false"
                                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button @click="saveResults(false)" :disabled="savingResults"
                                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Save</button>
                            <button @click="saveResults(true)" :disabled="savingResults"
                                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                {{ savingResults ? 'Saving...' : 'Save & Publish' }}
                            </button>
                        </div>
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
                        <h3 class="text-lg font-semibold text-red-600">Delete Exam</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-gray-600">Delete <strong>{{ deletingExam?.title }}</strong>? All results
                            will also be deleted.</p>
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

ui.setPageTitle('Exams')

const exams = ref([])
const courses = ref([])
const stats = ref({})
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const savingResults = ref(false)
const loadingResults = ref(false)
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })

const showModal = ref(false)
const showResultsModal = ref(false)
const showDeleteModal = ref(false)

const editingExam = ref(null)
const activeExam = ref(null)
const deletingExam = ref(null)
const resultStudents = ref([])
const errors = ref({})

const filters = reactive({ course_id: '', exam_type: '', status: '', page: 1 })
const form = reactive({ title: '', course_id: '', exam_type: 'midterm', semester: 'Spring 2025', academic_year: '2024-2025', exam_date: '', start_time: '', end_time: '', venue: '', total_marks: 100, passing_marks: 40, weightage: 0, status: 'scheduled' })

const pageNumbers = computed(() => { const p = []; for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) p.push(i); return p })
const statCards = computed(() => [
    { label: 'Total', value: stats.value.total || 0 },
    { label: 'Upcoming', value: stats.value.upcoming || 0, color: 'text-indigo-600', border: 'border-indigo-200' },
    { label: 'Completed', value: stats.value.completed || 0, color: 'text-green-600', border: 'border-green-200' },
    { label: 'Published', value: stats.value.published || 0, color: 'text-blue-600', border: 'border-blue-200' },
])

const typeColor = (t) => ({
    midterm: 'text-purple-700 bg-purple-50',
    final: 'text-red-700 bg-red-50',
    quiz: 'text-blue-700 bg-blue-50',
    assignment: 'text-green-700 bg-green-50',
    lab: 'text-teal-700 bg-teal-50',
    viva: 'text-amber-700 bg-amber-50',
}[t] || 'text-gray-700 bg-gray-100')

const statusColor = (s) => ({
    scheduled: 'text-yellow-700 bg-yellow-50',
    ongoing: 'text-blue-700 bg-blue-50',
    completed: 'text-green-700 bg-green-50',
    cancelled: 'text-red-700 bg-red-50',
}[s] || 'text-gray-700 bg-gray-100')

const gradeColor = (gp) => {
    if (!gp) return 'text-gray-400'
    if (gp >= 3.5) return 'text-green-600'
    if (gp >= 3.0) return 'text-blue-600'
    if (gp >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
}

const calcGrade = (student) => {
    if (!student.marks_obtained || !activeExam.value) { student.grade_letter = null; student.grade_point = null; return }
    const pct = (parseFloat(student.marks_obtained) / activeExam.value.total_marks) * 100
    if (pct >= 80) { student.grade_letter = 'A+'; student.grade_point = 4.00 }
    else if (pct >= 75) { student.grade_letter = 'A'; student.grade_point = 3.75 }
    else if (pct >= 70) { student.grade_letter = 'A-'; student.grade_point = 3.50 }
    else if (pct >= 65) { student.grade_letter = 'B+'; student.grade_point = 3.25 }
    else if (pct >= 60) { student.grade_letter = 'B'; student.grade_point = 3.00 }
    else if (pct >= 55) { student.grade_letter = 'B-'; student.grade_point = 2.75 }
    else if (pct >= 50) { student.grade_letter = 'C+'; student.grade_point = 2.50 }
    else if (pct >= 45) { student.grade_letter = 'C'; student.grade_point = 2.25 }
    else if (pct >= 40) { student.grade_letter = 'D'; student.grade_point = 2.00 }
    else { student.grade_letter = 'F'; student.grade_point = 0.00 }
}

const fetchExams = async () => {
    loading.value = true
    try {
        const res = await api.get('/exams', { course_id: filters.course_id || undefined, exam_type: filters.exam_type || undefined, status: filters.status || undefined, page: filters.page })
        exams.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => { try { const r = await api.get('/exams/stats'); stats.value = r.data || {} } catch { } }
const fetchCourses = async () => { try { const r = await api.get('/courses', { all: true }); courses.value = r.data || [] } catch { } }
const changePage = (p) => { filters.page = p; fetchExams() }
const clearFilters = () => { Object.assign(filters, { course_id: '', exam_type: '', status: '', page: 1 }); fetchExams() }

const openCreate = () => {
    editingExam.value = null; errors.value = {}
    Object.assign(form, { title: '', course_id: '', exam_type: 'midterm', semester: 'Spring 2025', academic_year: '2024-2025', exam_date: '', start_time: '', end_time: '', venue: '', total_marks: 100, passing_marks: 40, weightage: 0, status: 'scheduled' })
    showModal.value = true
}

const openEdit = (e) => {

    editingExam.value = e; errors.value = {}
    Object.assign(form, { title: e.title, course_id: e.course?.id, exam_type: e.exam_type, semester: e.semester, academic_year: e.academic_year, exam_date: e.exam_date || '', start_time: e.start_time || '', end_time: e.end_time || '', venue: e.venue || '', total_marks: e.total_marks, passing_marks: e.passing_marks, weightage: e.weightage, status: e.status })
    showModal.value = true
}

const handleSubmit = async () => {
    errors.value = {}
    if (!form.title) { errors.value.title = 'Required'; return }
    if (!form.course_id && !editingExam.value) { errors.value.course_id = 'Required'; return }
    saving.value = true
    try {
        editingExam.value ? await api.put(`/exams/${editingExam.value.id}`, form) : await api.post('/exams', form)
        toast.add({ title: editingExam.value ? 'Exam updated' : 'Exam scheduled', color: 'green' })
        showModal.value = false; fetchExams(); fetchStats()
    } catch (err) {
        const errs = err?.data?.errors || {}
        errors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
    } finally { saving.value = false }
}

const openResults = async (exam) => {
    activeExam.value = exam
    showResultsModal.value = true
    loadingResults.value = true
    try {
        const res = await api.get(`/exams/${exam.id}/students`)
        resultStudents.value = res.students || []
    } finally { loadingResults.value = false }
}

const saveResults = async (publish) => {
    savingResults.value = true
    try {
        await api.post(`/exams/${activeExam.value.id}/results`, { results: resultStudents.value })
        if (publish) await api.patch(`/exams/${activeExam.value.id}/publish`)
        toast.add({ title: publish ? 'Results saved & published' : 'Results saved', color: 'green' })
        showResultsModal.value = false; fetchExams(); fetchStats()
    } finally { savingResults.value = false }
}

const confirmDelete = (e) => { deletingExam.value = e; showDeleteModal.value = true }

const handleDelete = async () => {
    deleting.value = true
    try {
        await api.delete(`/exams/${deletingExam.value.id}`)
        toast.add({ title: 'Exam deleted', color: 'green' })
        showDeleteModal.value = false; fetchExams(); fetchStats()
    } finally { deleting.value = false }
}

onMounted(async () => {
    await Promise.all([fetchExams(), fetchStats(), fetchCourses()])
})
</script>