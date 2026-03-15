<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Reports</h2>
                <p class="text-sm text-gray-500 mt-0.5">Generate and export institutional reports</p>
            </div>
        </div>

        <!-- Overview stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div v-for="s in overviewCards" :key="s.label" :class="['rounded-xl border p-4', s.bg, s.border]">
                <p :class="['text-2xl font-bold', s.color]">{{ s.value }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ s.label }}</p>
            </div>
        </div>

        <!-- Report selector -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <button v-for="r in reportTypes" :key="r.key" @click="selectReport(r.key)"
                :class="['rounded-xl border p-4 text-left transition-all hover:shadow-md', activeReport === r.key ? 'ring-2 ring-indigo-500 border-indigo-300 bg-indigo-50' : 'bg-white border-gray-200 hover:border-gray-300']">
                <div :class="['w-9 h-9 rounded-lg flex items-center justify-center mb-3', r.iconBg]">
                    <UIcon :name="r.icon" class="w-5 h-5" :class="r.iconColor" />
                </div>
                <p class="text-sm font-semibold text-gray-900">{{ r.label }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ r.desc }}</p>
            </button>
        </div>

        <!-- Report content -->
        <div v-if="activeReport" class="bg-white rounded-xl border border-gray-200 overflow-hidden">

            <!-- Report header with filters + export -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
                <h3 class="text-base font-semibold text-gray-900">{{ currentReportType?.label }} Report</h3>
                <div class="flex flex-wrap gap-2 items-center">
                    <!-- Filters per report -->
                    <template v-if="activeReport === 'students'">
                        <select v-model="reportFilters.department_id" @change="loadReport"
                            class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">All Departments</option>
                            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }}</option>
                        </select>
                    </template>
                    <template v-if="['fees', 'exams', 'attendance'].includes(activeReport)">
                        <input v-model="reportFilters.semester" @change="loadReport" autocomplete="new-password"
                            placeholder="Semester"
                            class="w-36 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700" />
                        <input v-model="reportFilters.academic_year" @change="loadReport" autocomplete="new-password"
                            placeholder="Acad. Year"
                            class="w-28 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700" />
                    </template>
                    <template v-if="activeReport === 'admissions'">
                        <input v-model="reportFilters.year" @change="loadReport" autocomplete="new-password"
                            placeholder="Year"
                            class="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700" />
                    </template>
                    <button @click="loadReport"
                        class="px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                    </button>
                    <button @click="downloadPdf" :disabled="exporting"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                        <UIcon name="i-heroicons-document-arrow-down" class="w-4 h-4" />
                        {{ exporting ? 'Exporting...' : 'Download PDF' }}
                    </button>
                </div>
            </div>

            <div v-if="loadingReport" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>

            <!-- ── STUDENTS REPORT ── -->
            <div v-else-if="activeReport === 'students' && reportData" class="p-6 space-y-5">
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div v-for="s in studentSummaryCards" :key="s.label" class="bg-gray-50 rounded-xl p-3 text-center">
                        <p class="text-xl font-bold text-gray-900">{{ s.value }}</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ s.label }}</p>
                    </div>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">By Department</h4>
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        <div v-for="d in reportData.by_department" :key="d.code" class="bg-indigo-50 rounded-lg p-3">
                            <p class="text-xs font-bold text-indigo-700">{{ d.code }}</p>
                            <p class="text-lg font-bold text-gray-900">{{ d.count }}</p>
                            <p class="text-xs text-gray-500">{{ d.male }}M / {{ d.female }}F</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">Student List (top 50)</h4>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 border-y border-gray-200">
                                <tr>
                                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">#</th>
                                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">Student ID</th>
                                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">Name</th>
                                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">Dept</th>
                                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">Semester</th>
                                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">CGPA</th>
                                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="(s, i) in reportData.data" :key="s.student_id" class="hover:bg-gray-50">
                                    <td class="px-3 py-2 text-xs text-gray-400">{{ i + 1 }}</td>
                                    <td class="px-3 py-2 text-xs font-mono text-indigo-700">{{ s.student_id }}</td>
                                    <td class="px-3 py-2 text-sm font-medium text-gray-900">{{ s.name }}</td>
                                    <td class="px-3 py-2 text-xs text-gray-600">{{ s.department }}</td>
                                    <td class="px-3 py-2 text-xs text-gray-600">{{ s.semester }}</td>
                                    <td class="px-3 py-2 text-sm font-bold"
                                        :class="s.cgpa >= 3.5 ? 'text-green-600' : s.cgpa >= 2.5 ? 'text-blue-600' : 'text-gray-600'">
                                        {{ s.cgpa || '—' }}</td>
                                    <td class="px-3 py-2"><span
                                            class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700 capitalize">{{
                                                s.status }}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ── FEES REPORT ── -->
            <div v-else-if="activeReport === 'fees' && reportData" class="p-6 space-y-5">
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div class="bg-green-50 rounded-xl p-3 text-center col-span-2">
                        <p class="text-xl font-bold text-green-600">৳{{ formatMoney(reportData.summary.total_collected)
                        }}</p>
                        <p class="text-xs text-gray-500">Collected</p>
                    </div>
                    <div class="bg-red-50 rounded-xl p-3 text-center col-span-2">
                        <p class="text-xl font-bold text-red-600">৳{{ formatMoney(reportData.summary.total_pending) }}
                        </p>
                        <p class="text-xs text-gray-500">Pending</p>
                    </div>
                    <div class="bg-indigo-50 rounded-xl p-3 text-center col-span-2">
                        <p class="text-xl font-bold text-indigo-600">{{ reportData.summary.collection_rate }}%</p>
                        <p class="text-xs text-gray-500">Collection Rate</p>
                    </div>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">By Fee Type</h4>
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">Type</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Invoiced</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Collected</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Pending</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Count</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="r in reportData.by_type" :key="r.fee_type" class="hover:bg-gray-50">
                                <td class="px-3 py-2 capitalize font-medium text-gray-900">{{ r.fee_type }}</td>
                                <td class="px-3 py-2 text-right text-gray-600">৳{{ formatMoney(r.invoiced) }}</td>
                                <td class="px-3 py-2 text-right text-green-600 font-medium">৳{{ formatMoney(r.collected)
                                }}</td>
                                <td class="px-3 py-2 text-right text-red-600 font-medium">৳{{ formatMoney(r.pending) }}
                                </td>
                                <td class="px-3 py-2 text-right text-gray-600">{{ r.count }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ── EXAMS/GRADES REPORT ── -->
            <div v-else-if="activeReport === 'exams' && reportData" class="p-6 space-y-5">
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div v-for="s in examSummaryCards" :key="s.label" class="bg-purple-50 rounded-xl p-3 text-center">
                        <p class="text-xl font-bold text-purple-700">{{ s.value }}</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ s.label }}</p>
                    </div>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">Grade Distribution</h4>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="g in reportData.grade_distribution" :key="g.grade"
                            class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            <span class="text-lg font-bold text-purple-700">{{ g.grade }}</span>
                            <span class="text-sm text-gray-500">{{ g.count }} students</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">Top 10 Students</h4>
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">#</th>
                                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">Name</th>
                                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">Student ID</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Avg GPA</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Courses</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="(s, i) in reportData.top_students" :key="s.student_id" class="hover:bg-gray-50">
                                <td class="px-3 py-2 text-xs text-gray-400">{{ i + 1 }}</td>
                                <td class="px-3 py-2 font-medium text-gray-900">{{ s.name }}</td>
                                <td class="px-3 py-2 text-xs font-mono text-indigo-700">{{ s.student_id }}</td>
                                <td class="px-3 py-2 text-right font-bold"
                                    :class="s.avg_gpa >= 3.5 ? 'text-green-600' : 'text-blue-600'">{{ s.avg_gpa }}</td>
                                <td class="px-3 py-2 text-right text-gray-600">{{ s.courses }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ── ATTENDANCE REPORT ── -->
            <div v-else-if="activeReport === 'attendance' && reportData" class="p-6 space-y-5">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div class="bg-amber-50 rounded-xl p-3 text-center">
                        <p class="text-xl font-bold text-amber-600">{{ reportData.summary.total_sessions }}</p>
                        <p class="text-xs text-gray-500">Sessions</p>
                    </div>
                    <div class="bg-green-50 rounded-xl p-3 text-center">
                        <p class="text-xl font-bold text-green-600">{{ reportData.summary.present }}</p>
                        <p class="text-xs text-gray-500">Present</p>
                    </div>
                    <div class="bg-red-50 rounded-xl p-3 text-center">
                        <p class="text-xl font-bold text-red-600">{{ reportData.summary.absent }}</p>
                        <p class="text-xs text-gray-500">Absent</p>
                    </div>
                    <div class="bg-indigo-50 rounded-xl p-3 text-center">
                        <p class="text-xl font-bold text-indigo-600">{{ reportData.summary.attendance_rate }}%</p>
                        <p class="text-xs text-gray-500">Attendance Rate</p>
                    </div>
                </div>
                <!-- Attendance rate bar -->
                <div class="bg-gray-50 rounded-xl p-4">
                    <div class="flex items-center justify-between text-sm mb-2">
                        <span class="font-medium text-gray-700">Overall Attendance Rate</span>
                        <span
                            :class="['font-bold', reportData.summary.attendance_rate >= 75 ? 'text-green-600' : 'text-red-600']">{{
                                reportData.summary.attendance_rate }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div :style="`width:${reportData.summary.attendance_rate}%`"
                            :class="['h-3 rounded-full', reportData.summary.attendance_rate >= 75 ? 'bg-green-500' : 'bg-red-500']" />
                    </div>
                </div>
            </div>

            <!-- ── ADMISSIONS REPORT ── -->
            <div v-else-if="activeReport === 'admissions' && reportData" class="p-6 space-y-5">
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div class="bg-cyan-50 rounded-xl p-3 text-center col-span-2">
                        <p class="text-xl font-bold text-cyan-600">{{ reportData.summary.total }}</p>
                        <p class="text-xs text-gray-500">Total</p>
                    </div>
                    <div class="bg-green-50 rounded-xl p-3 text-center col-span-2">
                        <p class="text-xl font-bold text-green-600">{{ reportData.summary.accepted }}</p>
                        <p class="text-xs text-gray-500">Accepted</p>
                    </div>
                    <div class="bg-indigo-50 rounded-xl p-3 text-center col-span-2">
                        <p class="text-xl font-bold text-indigo-600">{{ reportData.summary.accept_rate }}%</p>
                        <p class="text-xs text-gray-500">Accept Rate</p>
                    </div>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">By Department</h4>
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">Department</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Applied</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Accepted</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Enrolled</th>
                                <th class="px-3 py-2 text-right text-xs font-semibold text-gray-500">Rejected</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="d in reportData.by_department" :key="d.code" class="hover:bg-gray-50">
                                <td class="px-3 py-2 font-medium text-gray-900">{{ d.department }} <span
                                        class="text-xs text-gray-400">({{ d.code }})</span></td>
                                <td class="px-3 py-2 text-right font-bold text-gray-900">{{ d.applied }}</td>
                                <td class="px-3 py-2 text-right text-green-600 font-medium">{{ d.accepted }}</td>
                                <td class="px-3 py-2 text-right text-indigo-600 font-medium">{{ d.enrolled }}</td>
                                <td class="px-3 py-2 text-right text-red-600 font-medium">{{ d.rejected }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        <!-- Empty state -->
        <div v-if="!activeReport" class="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <UIcon name="i-heroicons-chart-pie" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">Select a report type above to get started</p>
        </div>

    </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const ui = useUiStore()
const api = useApi()
const toast = useToast()

ui.setPageTitle('Reports')

const activeReport = ref('')
const reportData = ref(null)
const overview = ref({})
const departments = ref([])
const loadingReport = ref(false)
const exporting = ref(false)

const reportFilters = reactive({ department_id: '', semester: 'Fall 2024', academic_year: '2024-2025', year: new Date().getFullYear().toString() })

const reportTypes = [
    { key: 'students', label: 'Students', desc: 'Enrollment & demographics', icon: 'i-heroicons-user-group', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { key: 'fees', label: 'Fee Report', desc: 'Collection & pending dues', icon: 'i-heroicons-banknotes', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { key: 'exams', label: 'Grades', desc: 'Results & GPA distribution', icon: 'i-heroicons-chart-bar', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    { key: 'attendance', label: 'Attendance', desc: 'Session & rate summary', icon: 'i-heroicons-check-circle', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { key: 'admissions', label: 'Admissions', desc: 'Applications & acceptance', icon: 'i-heroicons-inbox-arrow-down', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
]

const currentReportType = computed(() => reportTypes.find(r => r.key === activeReport.value))

const overviewCards = computed(() => [
    { label: 'Total Students', value: overview.value.students || 0, bg: 'bg-indigo-50', border: 'border-indigo-200', color: 'text-indigo-600' },
    { label: 'Faculty', value: overview.value.faculty || 0, bg: 'bg-blue-50', border: 'border-blue-200', color: 'text-blue-600' },
    { label: 'Active Enrollments', value: overview.value.enrollments || 0, bg: 'bg-green-50', border: 'border-green-200', color: 'text-green-600' },
    { label: 'Revenue Collected', value: '৳' + formatMoney(overview.value.revenue), bg: 'bg-amber-50', border: 'border-amber-200', color: 'text-amber-600' },
    { label: 'Pending Fees', value: '৳' + formatMoney(overview.value.pending_fees), bg: 'bg-red-50', border: 'border-red-200', color: 'text-red-600' },
    { label: 'Admissions', value: overview.value.admissions || 0, bg: 'bg-cyan-50', border: 'border-cyan-200', color: 'text-cyan-600' },
    { label: 'Exams Completed', value: overview.value.exams || 0, bg: 'bg-purple-50', border: 'border-purple-200', color: 'text-purple-600' },
    { label: 'Courses', value: overview.value.courses || 0, bg: 'bg-gray-50', border: 'border-gray-200', color: 'text-gray-700' },
])

const studentSummaryCards = computed(() => !reportData.value ? [] : [
    { label: 'Total', value: reportData.value.summary.total },
    { label: 'Active', value: reportData.value.summary.active },
    { label: 'Male', value: reportData.value.summary.male },
    { label: 'Female', value: reportData.value.summary.female },
    { label: 'Avg CGPA', value: reportData.value.summary.avg_cgpa },
])

const examSummaryCards = computed(() => !reportData.value ? [] : [
    { label: 'Total Grades', value: reportData.value.summary.total_grades },
    { label: 'Avg GPA', value: reportData.value.summary.avg_gpa },
    { label: 'Passed', value: reportData.value.summary.pass_count },
    { label: 'Failed', value: reportData.value.summary.fail_count },
    { label: 'Distinction', value: reportData.value.summary.distinction },
])

const formatMoney = (v) => Number(v || 0).toLocaleString('en-BD', { minimumFractionDigits: 0 })

const fetchOverview = async () => { try { const r = await api.get('/reports/overview'); overview.value = r.data || {} } catch { } }
const fetchDepartments = async () => { try { const r = await api.get('/departments', { all: true }); departments.value = r.data || [] } catch { } }

const selectReport = (key) => { activeReport.value = key; loadReport() }

const loadReport = async () => {
    if (!activeReport.value) return
    loadingReport.value = true
    reportData.value = null
    try {
        const params = {}
        if (reportFilters.department_id) params.department_id = reportFilters.department_id
        if (reportFilters.semester) params.semester = reportFilters.semester
        if (reportFilters.academic_year) params.academic_year = reportFilters.academic_year
        if (reportFilters.year) params.year = reportFilters.year
        const res = await api.get(`/reports/${activeReport.value}`, params)
        reportData.value = res
    } finally { loadingReport.value = false }
}

const downloadPdf = async () => {
    exporting.value = true
    try {
        const token = localStorage.getItem('unicore_token')
        const config = useRuntimeConfig()
        const params = new URLSearchParams()
        if (reportFilters.semester) params.append('semester', reportFilters.semester)
        if (reportFilters.academic_year) params.append('academic_year', reportFilters.academic_year)
        if (reportFilters.year) params.append('year', reportFilters.year)

        const res = await fetch(`${config.public.apiBase}/reports/pdf/${activeReport.value}?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) { toast.add({ title: 'PDF export failed', color: 'red' }); return }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${activeReport.value}-report-${new Date().toISOString().slice(0, 10)}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.add({ title: 'PDF downloaded', color: 'green' })
    } finally { exporting.value = false }
}

onMounted(async () => {
    await Promise.all([fetchOverview(), fetchDepartments()])
})
</script>