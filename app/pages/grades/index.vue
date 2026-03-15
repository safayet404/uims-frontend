<template>
    <div class="space-y-5">

        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Grades</h2>
                <p class="text-sm text-gray-500 mt-0.5">Enter and publish course grades</p>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.total || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Total Grades</p>
            </div>
            <div class="bg-green-50 rounded-xl border border-green-200 p-4">
                <p class="text-2xl font-bold text-green-600">{{ stats.published || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Published</p>
            </div>
            <div class="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
                <p class="text-2xl font-bold text-yellow-600">{{ stats.pending || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Pending</p>
            </div>
            <div class="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
                <p class="text-2xl font-bold text-indigo-600">{{ stats.avg_gpa || '0.00' }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Avg GPA</p>
            </div>
        </div>

        <!-- Course selector -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex flex-wrap gap-3 items-end">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Course *</label>
                    <select v-model="gradeForm.course_id"
                        class="w-56 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                        <option value="">Select course</option>
                        <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Semester</label>
                    <input v-model="gradeForm.semester" autocomplete="new-password" placeholder="Spring 2025"
                        class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                    <input v-model="gradeForm.academic_year" autocomplete="new-password" placeholder="2024-2025"
                        class="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                </div>
                <button @click="loadGrades" :disabled="!gradeForm.course_id || loadingGrades"
                    class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
                    Load Students
                </button>
            </div>
        </div>

        <!-- Grade entry table -->
        <div v-if="gradeStudents.length || loadingGrades"
            class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
                <div class="text-sm text-gray-600">
                    <span class="font-medium">{{ gradeStudents.length }}</span> students ·
                    <span class="text-green-600 font-medium">{{ publishedCount }} published</span>
                </div>
                <div class="flex gap-2">
                    <button @click="saveGrades" :disabled="saving"
                        class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        {{ saving ? 'Saving...' : 'Save Grades' }}
                    </button>
                    <button @click="publishGrades" :disabled="publishing"
                        class="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                        {{ publishing ? 'Publishing...' : 'Publish All' }}
                    </button>
                </div>
            </div>

            <div v-if="loadingGrades" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <table v-else class="w-full">
                <thead class="border-b border-gray-100">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            Student ID</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Marks (0–100)
                        </th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">GPA</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-for="(s, idx) in gradeStudents" :key="s.student_profile_id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-xs text-gray-400">{{ idx + 1 }}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <img :src="s.avatar_url" :alt="s.name" class="w-7 h-7 rounded-full object-cover" />
                                <p class="text-sm font-medium text-gray-900">{{ s.name }}</p>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <span class="text-xs font-mono text-indigo-700">{{ s.student_id }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <input v-model="s.total_marks" type="number" min="0" max="100" step="0.5"
                                :disabled="s.is_published" @input="calcGradeForStudent(s)"
                                class="w-24 mx-auto block px-2 py-1.5 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-400" />
                        </td>
                        <td class="px-4 py-3 text-center">
                            <span v-if="s.grade_letter" :class="['text-sm font-bold', gradeColor(s.grade_point)]">{{
                                s.grade_letter }}</span>
                            <span v-else class="text-xs text-gray-300">—</span>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <span v-if="s.grade_point" :class="['text-sm font-bold', gradeColor(s.grade_point)]">{{
                                s.grade_point }}</span>
                            <span v-else class="text-xs text-gray-300">—</span>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', s.is_published ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100']">
                                {{ s.is_published ? 'Published' : 'Draft' }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Grade distribution -->
        <div v-if="stats.by_grade?.length" class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Grade Distribution (Published)</h3>
            <div class="flex flex-wrap gap-3">
                <div v-for="g in stats.by_grade" :key="g.grade_letter"
                    class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span :class="['text-lg font-bold', gradeColor(gradeLetterToPoint(g.grade_letter))]">{{
                        g.grade_letter }}</span>
                    <span class="text-sm text-gray-500">{{ g.count }} students</span>
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

ui.setPageTitle('Grades')

const courses = ref([])
const stats = ref({})
const gradeStudents = ref([])
const loadingGrades = ref(false)
const saving = ref(false)
const publishing = ref(false)

const gradeForm = reactive({ course_id: '', semester: 'Spring 2025', academic_year: '2024-2025' })

const publishedCount = computed(() => gradeStudents.value.filter(s => s.is_published).length)

const gradeColor = (gp) => {
    if (!gp) return 'text-gray-400'
    if (gp >= 3.5) return 'text-green-600'
    if (gp >= 3.0) return 'text-blue-600'
    if (gp >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
}

const gradeLetterToPoint = (l) => ({ 'A+': 4.0, 'A': 3.75, 'A-': 3.5, 'B+': 3.25, 'B': 3.0, 'B-': 2.75, 'C+': 2.5, 'C': 2.25, 'D': 2.0, 'F': 0 }[l] || 0)

const calcGradeForStudent = (s) => {
    if (!s.total_marks) { s.grade_letter = null; s.grade_point = null; return }
    const pct = parseFloat(s.total_marks)
    if (pct >= 80) { s.grade_letter = 'A+'; s.grade_point = 4.00 }
    else if (pct >= 75) { s.grade_letter = 'A'; s.grade_point = 3.75 }
    else if (pct >= 70) { s.grade_letter = 'A-'; s.grade_point = 3.50 }
    else if (pct >= 65) { s.grade_letter = 'B+'; s.grade_point = 3.25 }
    else if (pct >= 60) { s.grade_letter = 'B'; s.grade_point = 3.00 }
    else if (pct >= 55) { s.grade_letter = 'B-'; s.grade_point = 2.75 }
    else if (pct >= 50) { s.grade_letter = 'C+'; s.grade_point = 2.50 }
    else if (pct >= 45) { s.grade_letter = 'C'; s.grade_point = 2.25 }
    else if (pct >= 40) { s.grade_letter = 'D'; s.grade_point = 2.00 }
    else { s.grade_letter = 'F'; s.grade_point = 0.00 }
}

const fetchCourses = async () => { try { const r = await api.get('/courses', { all: true }); courses.value = r.data || [] } catch { } }
const fetchStats = async () => { try { const r = await api.get('/grades/stats'); stats.value = r.data || {} } catch { } }

const loadGrades = async () => {
    if (!gradeForm.course_id) return
    loadingGrades.value = true
    try {
        const res = await api.get('/grades/course', { course_id: gradeForm.course_id, semester: gradeForm.semester, academic_year: gradeForm.academic_year })
        gradeStudents.value = res.data || []
    } finally { loadingGrades.value = false }
}

const saveGrades = async () => {
    saving.value = true
    try {
        await api.post('/grades/save', {
            course_id: gradeForm.course_id,
            semester: gradeForm.semester,
            academic_year: gradeForm.academic_year,
            grades: gradeStudents.value.map(s => ({
                enrollment_id: s.enrollment_id,
                student_profile_id: s.student_profile_id,
                total_marks: s.total_marks || null,
                remarks: s.remarks || null,
            })),
        })
        toast.add({ title: 'Grades saved', color: 'green' })
        loadGrades(); fetchStats()
    } finally { saving.value = false }
}

const publishGrades = async () => {
    if (!confirm('Publish all grades for this course? Students will be able to see them.')) return
    publishing.value = true
    try {
        const res = await api.post('/grades/publish', { course_id: gradeForm.course_id, semester: gradeForm.semester, academic_year: gradeForm.academic_year })
        toast.add({ title: res.message || 'Grades published', color: 'green' })
        loadGrades(); fetchStats()
    } finally { publishing.value = false }
}

onMounted(async () => {
    await Promise.all([fetchCourses(), fetchStats()])
})
</script>