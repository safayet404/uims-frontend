<template>
    <div class="space-y-5">

        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Attendance Report</h2>
                <p class="text-sm text-gray-500 mt-0.5">View attendance percentages per course</p>
            </div>
            <NuxtLink to="/attendance"
                class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" /> Back
            </NuxtLink>
        </div>

        <!-- Course selector -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex flex-wrap gap-3">
                <select v-model="filters.course_id"
                    class="w-56 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">Select Course</option>
                    <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
                </select>
                <input v-model="filters.semester" autocomplete="new-password" placeholder="Semester (e.g. Spring 2025)"
                    class="w-44 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                <input v-model="filters.academic_year" autocomplete="new-password" placeholder="Academic Year"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                <button @click="fetchReport" :disabled="!filters.course_id || loading"
                    class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
                    Generate Report
                </button>
            </div>
        </div>

        <!-- Report summary -->
        <div v-if="course" class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-4">
            <div>
                <p class="text-xs text-indigo-500">Course</p>
                <p class="text-sm font-bold text-indigo-900">{{ course.code }} — {{ course.name }}</p>
            </div>
            <div class="ml-auto flex gap-6 text-center">
                <div>
                    <p class="text-2xl font-bold text-indigo-700">{{ totalSessions }}</p>
                    <p class="text-xs text-indigo-500">Sessions</p>
                </div>
                <div>
                    <p class="text-2xl font-bold text-green-700">{{ goodCount }}</p>
                    <p class="text-xs text-gray-500">≥75% (Good)</p>
                </div>
                <div>
                    <p class="text-2xl font-bold text-yellow-700">{{ warningCount }}</p>
                    <p class="text-xs text-gray-500">60–74% (Warning)</p>
                </div>
                <div>
                    <p class="text-2xl font-bold text-red-700">{{ dangerCount }}</p>
                    <p class="text-xs text-gray-500">&lt;60% (Danger)</p>
                </div>
            </div>
        </div>

        <!-- Report table -->
        <div v-if="report.length || loading" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            Student ID</th>
                        <th
                            class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Present</th>
                        <th
                            class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Absent</th>
                        <th
                            class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Late</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attendance %</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="(r, idx) in sortedReport" :key="r.student_profile_id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-xs text-gray-400">{{ idx + 1 }}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <img :src="r.avatar_url" :alt="r.name"
                                    class="w-7 h-7 rounded-full object-cover shrink-0" />
                                <p class="text-sm font-medium text-gray-900">{{ r.name }}</p>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <span class="text-xs font-mono text-indigo-700">{{ r.student_id }}</span>
                        </td>
                        <td class="px-4 py-3 text-center hidden md:table-cell">
                            <span class="text-sm font-medium text-green-600">{{ r.present }}</span>
                        </td>
                        <td class="px-4 py-3 text-center hidden md:table-cell">
                            <span class="text-sm font-medium text-red-600">{{ r.absent }}</span>
                        </td>
                        <td class="px-4 py-3 text-center hidden md:table-cell">
                            <span class="text-sm font-medium text-yellow-600">{{ r.late }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <div class="w-24 bg-gray-100 rounded-full h-2">
                                    <div :style="`width:${r.percentage}%`"
                                        :class="['h-2 rounded-full', r.percentage >= 75 ? 'bg-green-500' : r.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500']" />
                                </div>
                                <span
                                    :class="['text-sm font-bold', r.percentage >= 75 ? 'text-green-600' : r.percentage >= 60 ? 'text-yellow-600' : 'text-red-600']">
                                    {{ r.percentage }}%
                                </span>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', r.status === 'good' ? 'text-green-700 bg-green-50' : r.status === 'warning' ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50']">
                                {{ r.status === 'good' ? 'Good' : r.status === 'warning' ? 'Warning' : 'Danger' }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else-if="!course" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">Select a course and generate report</p>
        </div>

    </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const ui = useUiStore()
const api = useApi()
ui.setPageTitle('Attendance Report')

const courses = ref([])
const report = ref([])
const course = ref(null)
const totalSessions = ref(0)
const loading = ref(false)

const filters = reactive({ course_id: '', semester: 'Spring 2025', academic_year: '2024-2025' })

const sortedReport = computed(() => [...report.value].sort((a, b) => b.percentage - a.percentage))
const goodCount = computed(() => report.value.filter(r => r.status === 'good').length)
const warningCount = computed(() => report.value.filter(r => r.status === 'warning').length)
const dangerCount = computed(() => report.value.filter(r => r.status === 'danger').length)

const fetchCourses = async () => { try { const r = await api.get('/courses', { all: true }); courses.value = r.data || [] } catch { } }

const fetchReport = async () => {
    if (!filters.course_id) return
    loading.value = true
    try {
        const res = await api.get('/attendance/report', { course_id: filters.course_id, semester: filters.semester, academic_year: filters.academic_year })
        report.value = res.data || []
        course.value = res.course
        totalSessions.value = res.total_sessions || 0
    } finally { loading.value = false }
}

onMounted(fetchCourses)
</script>