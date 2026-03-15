<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Timetable</h2>
                <p class="text-sm text-gray-500 mt-0.5">Weekly class schedule</p>
            </div>
            <div class="flex gap-2">
                <button @click="view = view === 'grid' ? 'list' : 'grid'"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <UIcon :name="view === 'grid' ? 'i-heroicons-list-bullet' : 'i-heroicons-table-cells'"
                        class="w-4 h-4" />
                    {{ view === 'grid' ? 'List View' : 'Grid View' }}
                </button>
                <button @click="openCreate"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Slot
                </button>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.total_slots || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Total Slots</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-indigo-600">{{ stats.courses_scheduled || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Courses Scheduled</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-blue-600">{{ stats.rooms_used || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Rooms Used</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-green-600">{{ Object.values(timetable).flat().length }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Loaded Slots</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex flex-wrap gap-3">
                <select v-model="filters.department_id" @change="fetchTimetable"
                    class="w-44 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Departments</option>
                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} — {{ d.name }}</option>
                </select>
                <input v-model="filters.semester" @change="fetchTimetable" autocomplete="new-password"
                    placeholder="Semester"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700" />
                <input v-model="filters.academic_year" @change="fetchTimetable" autocomplete="new-password"
                    placeholder="Academic Year"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700" />
                <select v-model="filters.section" @change="fetchTimetable"
                    class="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                </select>
                <button @click="fetchTimetable"
                    class="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- ── GRID VIEW ── -->
        <div v-if="view === 'grid'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <div v-else class="overflow-x-auto">
                <table class="w-full min-w-225">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200">
                            <th class="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                            <th v-for="day in days" :key="day"
                                :class="['px-3 py-3 text-center text-xs font-semibold uppercase', isToday(day) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500']">
                                <div>{{ day }}</div>
                                <div v-if="isToday(day)" class="text-[10px] text-indigo-400 font-normal">Today</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(slot, idx) in timeSlots" :key="slot.start"
                            :class="['border-b border-gray-50', idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30']">
                            <td class="px-3 py-2 text-xs text-gray-400 font-medium whitespace-nowrap align-top pt-3">
                                {{ slot.label }}
                            </td>
                            <td v-for="day in days" :key="day" class="px-2 py-2 align-top min-w-32.5">
                                <div v-for="s in getSlotsForDayTime(day, slot.start)" :key="s.id"
                                    class="mb-1 rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity text-white text-xs"
                                    :style="`background-color: ${s.color || '#6366f1'}`" @click="viewSlot(s)">
                                    <p class="font-bold truncate">{{ s.course?.code }}</p>
                                    <p class="opacity-90 truncate text-[10px]">{{ s.course?.name }}</p>
                                    <div class="flex items-center gap-1 mt-1 opacity-80">
                                        <span v-if="s.room" class="text-[10px]">{{ s.room }}</span>
                                        <span v-if="s.section" class="text-[10px]">· §{{ s.section }}</span>
                                    </div>
                                    <p v-if="s.faculty" class="opacity-80 text-[10px] truncate mt-0.5">{{
                                        s.faculty.name?.split(' ').slice(-1)[0] }}</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!Object.values(timetable).flat().length" class="p-12 text-center">
                    <UIcon name="i-heroicons-calendar" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p class="text-gray-500 mb-3">No slots scheduled yet</p>
                    <button @click="openCreate"
                        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add
                        First Slot</button>
                </div>
            </div>
        </div>

        <!-- ── LIST VIEW ── -->
        <div v-if="view === 'list'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            Day</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Time</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Room</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Faculty</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Type</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="s in flatSlots" :key="s.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full shrink-0" :style="`background:${s.color}`"></div>
                                <div>
                                    <p class="text-sm font-semibold text-gray-900">{{ s.course?.code }}</p>
                                    <p class="text-xs text-gray-400 truncate max-w-36">{{ s.course?.name }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <span
                                :class="['text-xs font-medium px-2 py-0.5 rounded-full', isToday(s.day_of_week) ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600']">{{
                                    s.day_of_week }}</span>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <p class="text-xs font-medium text-gray-900">{{ s.start_time }} – {{ s.end_time }}</p>
                            <p class="text-xs text-gray-400">{{ s.duration }} min</p>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <span class="text-xs text-gray-600">{{ s.room || '—' }}</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-600 truncate max-w-32 block">{{ s.faculty?.name || '—'
                                }}</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', typeColor(s.slot_type)]">{{
                                    s.slot_type }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button @click="openEdit(s)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                </button>
                                <button @click="deleteSlot(s)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!flatSlots.length">
                        <td colspan="7" class="px-4 py-12 text-center text-gray-400 text-sm">No slots found</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ── VIEW SLOT MODAL ── -->
        <Teleport to="body">
            <div v-if="showViewModal && viewingSlot"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-sm" @click.stop>
                    <div class="h-2 rounded-t-2xl" :style="`background:${viewingSlot.color}`"></div>
                    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-gray-900">{{ viewingSlot.course?.code }}</h3>
                        <button @click="showViewModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-3">
                        <p class="text-sm text-gray-600">{{ viewingSlot.course?.name }}</p>
                        <div class="grid grid-cols-2 gap-3">
                            <div v-for="f in slotViewFields" :key="f.label" class="bg-gray-50 rounded-lg p-2.5">
                                <p class="text-xs text-gray-400">{{ f.label }}</p>
                                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ f.value || '—' }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showViewModal = false; openEdit(viewingSlot)"
                            class="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100">Edit</button>
                        <button @click="showViewModal = false; deleteSlot(viewingSlot)"
                            class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">Delete</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── CREATE/EDIT MODAL ── -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingSlot ? 'Edit Slot' :
                            'Add Timetable Slot' }}</h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <input type="text" style="display:none" autocomplete="username" />
                        <div class="grid grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Course *</label>
                                <select v-model="form.course_id" @change="onCourseChange"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Select course</option>
                                    <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}
                                    </option>
                                </select>
                                <p v-if="errors.course_id" class="text-red-500 text-xs mt-1">{{ errors.course_id }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Department *</label>
                                <select v-model="form.department_id"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Select department</option>
                                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }}</option>
                                </select>
                                <p v-if="errors.department_id" class="text-red-500 text-xs mt-1">{{ errors.department_id
                                    }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Faculty</label>
                                <select v-model="form.faculty_profile_id"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Unassigned</option>
                                    <option v-for="f in allFaculty" :key="f.id" :value="f.id">{{ f.name }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Day *</label>
                                <select v-model="form.day_of_week"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Section</label>
                                <select v-model="form.section"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">None</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Start Time * (HH:MM)</label>
                                <input v-model="form.start_time" autocomplete="new-password" placeholder="08:00"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-mono" />
                                <p v-if="errors.start_time" class="text-red-500 text-xs mt-1">{{ errors.start_time }}
                                </p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">End Time * (HH:MM)</label>
                                <input v-model="form.end_time" autocomplete="new-password" placeholder="09:30"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-mono" />
                                <p v-if="errors.end_time" class="text-red-500 text-xs mt-1">{{ errors.end_time }}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Room</label>
                                <input v-model="form.room" autocomplete="new-password" placeholder="CSE-101"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                <select v-model="form.slot_type"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="lecture">Lecture</option>
                                    <option value="lab">Lab</option>
                                    <option value="tutorial">Tutorial</option>
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
                                <label class="block text-xs font-medium text-gray-600 mb-1">Color</label>
                                <div class="flex gap-2 flex-wrap">
                                    <button v-for="c in colorOptions" :key="c" @click="form.color = c"
                                        :class="['w-7 h-7 rounded-full border-2 transition-transform', form.color === c ? 'border-gray-800 scale-110' : 'border-transparent']"
                                        :style="`background:${c}`" />
                                </div>
                            </div>
                        </div>

                        <!-- Conflict warning -->
                        <div v-if="conflictError"
                            class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-600 shrink-0" />
                            <p class="text-xs text-red-700">{{ conflictError }}</p>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSubmit" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving ? 'Saving...' : (editingSlot ? 'Save Changes' : 'Add Slot') }}
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

ui.setPageTitle('Timetable')

const timetable = ref({})
const flatSlots = ref([])
const departments = ref([])
const courses = ref([])
const allFaculty = ref([])
const stats = ref({})
const loading = ref(false)
const saving = ref(false)
const view = ref('grid')

const showModal = ref(false)
const showViewModal = ref(false)
const editingSlot = ref(null)
const viewingSlot = ref(null)
const conflictError = ref('')
const errors = ref({})

const filters = reactive({ department_id: '', semester: 'Spring 2025', academic_year: '2024-2025', section: '' })
const form = reactive({ course_id: '', department_id: '', faculty_profile_id: '', day_of_week: 'Monday', start_time: '08:00', end_time: '09:30', room: '', building: '', section: '', slot_type: 'lecture', semester: 'Spring 2025', academic_year: '2024-2025', color: '#6366f1' })

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const timeSlots = [
    { start: '08:00', end: '09:30', label: '8:00 AM' },
    { start: '09:30', end: '11:00', label: '9:30 AM' },
    { start: '11:00', end: '12:30', label: '11:00 AM' },
    { start: '13:30', end: '15:00', label: '1:30 PM' },
    { start: '15:00', end: '16:30', label: '3:00 PM' },
    { start: '16:30', end: '18:00', label: '4:30 PM' },
]
const colorOptions = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16']

const slotViewFields = computed(() => !viewingSlot.value ? [] : [
    { label: 'Day', value: viewingSlot.value.day_of_week },
    { label: 'Time', value: `${viewingSlot.value.start_time} – ${viewingSlot.value.end_time}` },
    { label: 'Room', value: viewingSlot.value.room },
    { label: 'Section', value: viewingSlot.value.section },
    { label: 'Faculty', value: viewingSlot.value.faculty?.name },
    { label: 'Type', value: viewingSlot.value.slot_type },
    { label: 'Dept', value: viewingSlot.value.department?.code },
    { label: 'Duration', value: viewingSlot.value.duration + ' min' },
])

const isToday = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()] === day
}

const getSlotsForDayTime = (day, startTime) => {
    return (timetable.value[day] || []).filter(s => s.start_time === startTime + ':00' || s.start_time === startTime)
}

const typeColor = (t) => ({ lecture: 'text-blue-700 bg-blue-50', lab: 'text-green-700 bg-green-50', tutorial: 'text-purple-700 bg-purple-50' }[t] || 'text-gray-700 bg-gray-100')

const fetchTimetable = async () => {
    loading.value = true
    try {
        const res = await api.get('/timetable', {
            department_id: filters.department_id || undefined,
            semester: filters.semester || undefined,
            academic_year: filters.academic_year || undefined,
            section: filters.section || undefined,
        })
        timetable.value = res.data || {}
        flatSlots.value = Object.values(res.data || {}).flat().sort((a, b) => days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week) || a.start_time.localeCompare(b.start_time))
    } finally { loading.value = false }
}

const fetchStats = async () => { try { const r = await api.get('/timetable/stats'); stats.value = r.data || {} } catch { } }
const fetchDepartments = async () => { try { const r = await api.get('/departments', { all: true }); departments.value = r.data || [] } catch { } }
const fetchCourses = async () => { try { const r = await api.get('/courses', { all: true }); courses.value = r.data || [] } catch { } }
const fetchFaculty = async () => {
    try {
        const r = await api.get('/faculty', { per_page: 200 })
        allFaculty.value = (r.data || []).map(f => ({ id: f.id, name: f.name }))
    } catch { }
}

const onCourseChange = () => {
    const course = courses.value.find(c => c.id == form.course_id)
    if (course?.department?.id) form.department_id = course.department.id
    if (course?.course_type === 'lab') form.slot_type = 'lab'
}

const openCreate = () => {
    editingSlot.value = null; errors.value = {}; conflictError.value = ''
    Object.assign(form, { course_id: '', department_id: filters.department_id || '', faculty_profile_id: '', day_of_week: 'Monday', start_time: '08:00', end_time: '09:30', room: '', building: '', section: filters.section || '', slot_type: 'lecture', semester: filters.semester || 'Spring 2025', academic_year: filters.academic_year || '2024-2025', color: '#6366f1' })
    showModal.value = true
}

const openEdit = (s) => {
    editingSlot.value = s; errors.value = {}; conflictError.value = ''
    Object.assign(form, { course_id: s.course?.id, department_id: s.department?.id, faculty_profile_id: s.faculty?.id || '', day_of_week: s.day_of_week, start_time: s.start_time?.slice(0, 5), end_time: s.end_time?.slice(0, 5), room: s.room || '', building: s.building || '', section: s.section || '', slot_type: s.slot_type, semester: s.semester, academic_year: s.academic_year, color: s.color || '#6366f1' })
    showModal.value = true
}

const handleSubmit = async () => {
    errors.value = {}; conflictError.value = ''
    if (!form.course_id) { errors.value.course_id = 'Required'; return }
    if (!form.department_id) { errors.value.department_id = 'Required'; return }
    if (!form.start_time) { errors.value.start_time = 'Required'; return }
    if (!form.end_time) { errors.value.end_time = 'Required'; return }
    saving.value = true
    try {
        editingSlot.value ? await api.put(`/timetable/${editingSlot.value.id}`, form) : await api.post('/timetable', form)
        toast.add({ title: editingSlot.value ? 'Slot updated' : 'Slot added', color: 'green' })
        showModal.value = false; fetchTimetable(); fetchStats()
    } catch (err) {
        const msg = err?.data?.message || ''
        if (msg.includes('already') || msg.includes('conflict') || msg.includes('booked')) { conflictError.value = msg }
        else {
            const errs = err?.data?.errors || {}
            errors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
        }
    } finally { saving.value = false }
}

const viewSlot = (s) => { viewingSlot.value = s; showViewModal.value = true }

const deleteSlot = async (s) => {
    if (!confirm(`Delete ${s.course?.code} slot on ${s.day_of_week}?`)) return
    try {
        await api.delete(`/timetable/${s.id}`)
        toast.add({ title: 'Slot deleted', color: 'green' })
        fetchTimetable(); fetchStats()
    } catch { }
}

onMounted(async () => {
    await Promise.all([fetchTimetable(), fetchStats(), fetchDepartments(), fetchCourses(), fetchFaculty()])
})
</script>