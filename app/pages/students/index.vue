<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Students</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage all enrolled students</p>
            </div>
            <div class="flex gap-2">
                <button @click="handleExport" :disabled="exporting"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                    {{ exporting ? 'Exporting...' : 'Export' }}
                </button>
                <button @click="openCreate"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Student
                </button>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div v-for="s in statCards" :key="s.label" class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-gray-900">{{ s.value }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ s.label }}</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div class="flex flex-wrap gap-3">
                <div class="flex-1 min-w-48 relative">
                    <UIcon name="i-heroicons-magnifying-glass"
                        class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input v-model="filters.search" @input="debouncedFetch" type="search" autocomplete="new-password"
                        placeholder="Search name, email, student ID..."
                        class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                </div>
                <select v-model="filters.department_id" @change="fetchStudents"
                    class="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Departments</option>
                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} — {{ d.name }}</option>
                </select>
                <select v-model="filters.academic_status" @change="fetchStudents"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Status</option>
                    <option value="regular">Regular</option>
                    <option value="on-leave">On Leave</option>
                    <option value="suspended">Suspended</option>
                    <option value="graduated">Graduated</option>
                    <option value="dropped">Dropped</option>
                </select>
                <select v-model="filters.batch" @change="fetchStudents"
                    class="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Batches</option>
                    <option v-for="b in batches" :key="b" :value="b">{{ b }}</option>
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
            <div v-else-if="!students.length" class="p-12 text-center">
                <UIcon name="i-heroicons-user-group" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 mb-3">No students found</p>
                <button @click="openCreate"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add
                    First Student</button>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Student</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Student ID</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Department</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Batch / Sem</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            CGPA</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="s in students" :key="s.id" class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                                <img :src="s.avatar_url" :alt="s.name"
                                    class="w-9 h-9 rounded-full object-cover shrink-0" />
                                <div class="min-w-0">
                                    <p class="text-sm font-semibold text-gray-900 truncate">{{ s.name }}</p>
                                    <p class="text-xs text-gray-400 truncate">{{ s.email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <span
                                class="text-xs font-mono font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{{
                                    s.student_id }}</span>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <div>
                                <p class="text-xs font-medium text-gray-900">{{ s.department?.code || '—' }}</p>
                                <p class="text-xs text-gray-400">{{ s.program?.code || '—' }}</p>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <p class="text-xs text-gray-700">{{ s.batch || '—' }}</p>
                            <p class="text-xs text-gray-400">{{ s.semester || '—' }} sem</p>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span v-if="s.cgpa" :class="['text-sm font-bold', cgpaColor(s.cgpa)]">{{ s.cgpa }}</span>
                            <span v-else class="text-xs text-gray-400">N/A</span>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', academicStatusClass(s.academic_status)]">
                                {{ s.academic_status }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button @click="viewStudent(s)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                                </button>
                                <button @click="openEdit(s)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                </button>
                                <button @click="confirmDelete(s)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="pagination.last_page > 1"
                class="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                <p class="text-sm text-gray-500">Showing {{ (pagination.current_page - 1) * 15 + 1 }}–{{
                    Math.min(pagination.current_page * 15, pagination.total) }} of {{ pagination.total }}</p>
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

        <!-- ── CREATE/EDIT MODAL ── -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingStudent ? 'Edit Student' :
                            'Add New Student' }}</h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-5">
                        <!-- Hidden inputs to prevent autofill -->
                        <input type="text" style="display:none" autocomplete="username" />
                        <input type="password" style="display:none" autocomplete="new-password" />

                        <!-- Personal Info -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">Personal
                                Information</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                                    <input v-model="form.name" autocomplete="new-password"
                                        placeholder="Student full name"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                    <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                                    <input v-model="form.email" type="text" inputmode="email"
                                        autocomplete="new-password" placeholder="student@unicore.edu"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                    <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                    <input v-model="form.phone" autocomplete="new-password" placeholder="+880..."
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                                    <select v-model="form.gender"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                                    <input v-model="form.date_of_birth" type="date"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div v-if="!editingStudent">
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Password</label>
                                    <input v-model="form.password" type="password" autocomplete="new-password"
                                        placeholder="Default: password"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                            </div>
                        </div>

                        <!-- Academic Info -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">Academic
                                Information</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Student ID *</label>
                                    <input v-model="form.student_id" autocomplete="new-password"
                                        placeholder="212-0136-006" maxlength="12"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-mono" />
                                    <p class="text-xs text-gray-400 mt-0.5">Format: YYS-SSSS-DDD</p>
                                    <p v-if="errors.student_id" class="text-red-500 text-xs mt-1">{{ errors.student_id
                                    }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Department *</label>
                                    <select v-model="form.department_id" @change="loadPrograms"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select department</option>
                                        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} — {{
                                            d.name }}</option>
                                    </select>
                                    <p v-if="errors.department_id" class="text-red-500 text-xs mt-1">{{
                                        errors.department_id }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Program *</label>
                                    <select v-model="form.program_id"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select program</option>
                                        <option v-for="p in filteredPrograms" :key="p.id" :value="p.id">{{ p.name }}
                                        </option>
                                    </select>
                                    <p v-if="errors.program_id" class="text-red-500 text-xs mt-1">{{ errors.program_id
                                    }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Batch</label>
                                    <input v-model="form.batch" autocomplete="new-password" placeholder="e.g. 2021"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Current Semester</label>
                                    <select v-model="form.semester"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select semester</option>
                                        <option v-for="s in semesters" :key="s" :value="s">{{ s }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Section</label>
                                    <select v-model="form.section"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select section</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Admission Date</label>
                                    <input v-model="form.admission_date" type="date"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div v-if="editingStudent">
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Academic Status</label>
                                    <select v-model="form.academic_status"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="regular">Regular</option>
                                        <option value="on-leave">On Leave</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="graduated">Graduated</option>
                                        <option value="dropped">Dropped</option>
                                    </select>
                                </div>
                                <div v-if="editingStudent">
                                    <label class="block text-xs font-medium text-gray-600 mb-1">CGPA</label>
                                    <input v-model="form.cgpa" type="number" step="0.01" min="0" max="4"
                                        placeholder="0.00 – 4.00"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSubmit" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving ? 'Saving...' : (editingStudent ? 'Save Changes' : 'Add Student') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── VIEW STUDENT MODAL ── -->
        <Teleport to="body">
            <div v-if="showViewModal && viewingStudent"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Student Profile</h3>
                        <button @click="showViewModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-5">
                        <!-- Header -->
                        <div class="flex items-center gap-4">
                            <img :src="viewingStudent.avatar_url" :alt="viewingStudent.name"
                                class="w-16 h-16 rounded-full object-cover" />
                            <div class="flex-1">
                                <h4 class="text-lg font-bold text-gray-900">{{ viewingStudent.name }}</h4>
                                <p class="text-sm text-gray-500">{{ viewingStudent.email }}</p>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    <span
                                        class="inline-flex px-2 py-0.5 text-xs font-mono font-medium text-indigo-700 bg-indigo-50 rounded">{{
                                            viewingStudent.student_id }}</span>
                                    <span
                                        :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', academicStatusClass(viewingStudent.academic_status)]">{{
                                            viewingStudent.academic_status }}</span>
                                    <span v-if="viewingStudent.cgpa"
                                        :class="['inline-flex px-2 py-0.5 text-xs font-bold rounded-full', cgpaColor(viewingStudent.cgpa)]">
                                        CGPA: {{ viewingStudent.cgpa }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Info sections -->
                        <div class="grid grid-cols-2 gap-3">
                            <div class="bg-indigo-50 rounded-xl p-3 col-span-2">
                                <p class="text-xs font-semibold text-indigo-600 mb-2">Academic</p>
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div>
                                        <p class="text-xs text-gray-400">Department</p>
                                        <p class="text-xs font-medium text-gray-900">{{ viewingStudent.department?.code
                                            || '—' }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-400">Program</p>
                                        <p class="text-xs font-medium text-gray-900">{{ viewingStudent.program?.code ||
                                            '—' }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-400">Batch</p>
                                        <p class="text-xs font-medium text-gray-900">{{ viewingStudent.batch || '—' }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-400">Semester</p>
                                        <p class="text-xs font-medium text-gray-900">{{ viewingStudent.semester || '—'
                                        }}</p>
                                    </div>
                                </div>
                            </div>
                            <div v-for="f in viewFields" :key="f.label" class="bg-gray-50 rounded-lg p-3">
                                <p class="text-xs text-gray-400 mb-0.5">{{ f.label }}</p>
                                <p class="text-sm font-medium text-gray-900">{{ f.value || '—' }}</p>
                            </div>
                        </div>

                        <!-- Guardian info (if detailed) -->
                        <div v-if="viewingStudent.father_name || viewingStudent.mother_name"
                            class="bg-gray-50 rounded-xl p-4">
                            <p class="text-xs font-semibold text-gray-600 mb-3">Guardian Information</p>
                            <div class="grid grid-cols-2 gap-3">
                                <div v-if="viewingStudent.father_name">
                                    <p class="text-xs text-gray-400">Father</p>
                                    <p class="text-sm font-medium text-gray-900">{{ viewingStudent.father_name }}</p>
                                    <p class="text-xs text-gray-500">{{ viewingStudent.father_phone }}</p>
                                </div>
                                <div v-if="viewingStudent.mother_name">
                                    <p class="text-xs text-gray-400">Mother</p>
                                    <p class="text-sm font-medium text-gray-900">{{ viewingStudent.mother_name }}</p>
                                    <p class="text-xs text-gray-500">{{ viewingStudent.mother_phone }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Previous Education -->
                        <div v-if="viewingStudent.ssc_school || viewingStudent.hsc_college"
                            class="bg-gray-50 rounded-xl p-4">
                            <p class="text-xs font-semibold text-gray-600 mb-3">Previous Education</p>
                            <div class="grid grid-cols-2 gap-3">
                                <div v-if="viewingStudent.ssc_school">
                                    <p class="text-xs text-gray-400">SSC</p>
                                    <p class="text-sm font-medium text-gray-900">{{ viewingStudent.ssc_school }}</p>
                                    <p class="text-xs text-gray-500">GPA: {{ viewingStudent.ssc_gpa }} ({{
                                        viewingStudent.ssc_year }})</p>
                                </div>
                                <div v-if="viewingStudent.hsc_college">
                                    <p class="text-xs text-gray-400">HSC</p>
                                    <p class="text-sm font-medium text-gray-900">{{ viewingStudent.hsc_college }}</p>
                                    <p class="text-xs text-gray-500">GPA: {{ viewingStudent.hsc_gpa }} ({{
                                        viewingStudent.hsc_year }})</p>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
                            <button v-if="viewingStudent.academic_status !== 'regular'"
                                @click="changeAcademicStatus(viewingStudent, 'regular')"
                                class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200">Set
                                Regular</button>
                            <button v-if="viewingStudent.academic_status !== 'on-leave'"
                                @click="changeAcademicStatus(viewingStudent, 'on-leave')"
                                class="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200">On
                                Leave</button>
                            <button v-if="viewingStudent.academic_status !== 'suspended'"
                                @click="changeAcademicStatus(viewingStudent, 'suspended')"
                                class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200">Suspend</button>
                            <button @click="() => { showViewModal = false; openEdit(viewingStudent) }"
                                class="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 ml-auto">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── DELETE MODAL ── -->
        <Teleport to="body">
            <div v-if="showDeleteModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-red-600">Delete Student</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-gray-600">Delete student <strong>{{ deletingStudent?.name }}</strong> ({{
                            deletingStudent?.student_id }})? This will also delete their user account.</p>
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

ui.setPageTitle('Students')

// ── State ─────────────────────────────────────────────────────
const students = ref([])
const departments = ref([])
const programs = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const exporting = ref(false)
const stats = ref({})
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })

const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)

const editingStudent = ref(null)
const viewingStudent = ref(null)
const deletingStudent = ref(null)
const errors = ref({})

const filters = reactive({ search: '', department_id: '', academic_status: '', batch: '', page: 1 })

const form = reactive({
    name: '', email: '', phone: '', gender: '', date_of_birth: '', password: '',
    student_id: '', department_id: '', program_id: '', batch: '',
    semester: '', section: '', admission_date: '', academic_status: 'regular', cgpa: '',
})

const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']
const batches = ['2019', '2020', '2021', '2022', '2023', '2024', '2025']

// ── Computed ──────────────────────────────────────────────────
const hasFilters = computed(() => filters.search || filters.department_id || filters.academic_status || filters.batch)

const filteredPrograms = computed(() =>
    form.department_id ? programs.value.filter(p => p.department_id == form.department_id) : programs.value
)

const pageNumbers = computed(() => {
    const pages = []
    for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) pages.push(i)
    return pages
})

const statCards = computed(() => [
    { label: 'Total', value: stats.value.total || 0 },
    { label: 'Regular', value: stats.value.regular || 0 },
    { label: 'On Leave', value: stats.value.on_leave || 0 },
    { label: 'Graduated', value: stats.value.graduated || 0 },
    { label: 'Suspended', value: stats.value.suspended || 0 },
])

const viewFields = computed(() => !viewingStudent.value ? [] : [
    { label: 'Phone', value: viewingStudent.value.phone },
    { label: 'Gender', value: viewingStudent.value.gender },
    { label: 'Date of Birth', value: viewingStudent.value.date_of_birth },
    { label: 'Blood Group', value: viewingStudent.value.blood_group },
    { label: 'Section', value: viewingStudent.value.section },
    { label: 'Admission', value: viewingStudent.value.admission_date },
    { label: 'Nationality', value: viewingStudent.value.nationality },
    { label: 'Religion', value: viewingStudent.value.religion },
])

// ── Helpers ───────────────────────────────────────────────────
const academicStatusClass = (s) => ({
    regular: 'text-green-700 bg-green-50',
    'on-leave': 'text-yellow-700 bg-yellow-50',
    suspended: 'text-red-700 bg-red-50',
    graduated: 'text-blue-700 bg-blue-50',
    dropped: 'text-gray-600 bg-gray-100',
}[s] || 'text-gray-600 bg-gray-100')

const cgpaColor = (gpa) => {
    if (gpa >= 3.5) return 'text-green-600'
    if (gpa >= 3.0) return 'text-blue-600'
    if (gpa >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
}

// ── Data fetching ─────────────────────────────────────────────
let searchTimer = null
const debouncedFetch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchStudents, 400) }

const fetchStudents = async () => {
    loading.value = true
    try {
        const res = await api.get('/students', {
            search: filters.search || undefined,
            department_id: filters.department_id || undefined,
            academic_status: filters.academic_status || undefined,
            batch: filters.batch || undefined,
            page: filters.page,
        })
        students.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => {
    try { const res = await api.get('/students/stats'); stats.value = res.data || {} } catch { }
}

const fetchDepartments = async () => {
    try { const res = await api.get('/departments', { all: true }); departments.value = res.data || [] } catch { }
}

const fetchPrograms = async () => {
    try { const res = await api.get('/programs', { all: true }); programs.value = res.data || [] } catch { }
}

const loadPrograms = () => { form.program_id = '' }

const changePage = (p) => { filters.page = p; fetchStudents() }
const clearFilters = () => { Object.assign(filters, { search: '', department_id: '', academic_status: '', batch: '', page: 1 }); fetchStudents() }

// ── CRUD ──────────────────────────────────────────────────────
const openCreate = () => {
    editingStudent.value = null; errors.value = {}
    Object.assign(form, { name: '', email: '', phone: '', gender: '', date_of_birth: '', password: '', student_id: '', department_id: '', program_id: '', batch: '', semester: '', section: '', admission_date: '', academic_status: 'regular', cgpa: '' })
    showModal.value = true
}

const openEdit = (s) => {
    editingStudent.value = s; errors.value = {}
    Object.assign(form, {
        name: s.name, email: s.email, phone: s.phone || '', gender: s.gender || '',
        date_of_birth: s.date_of_birth || '', password: '',
        student_id: s.student_id, department_id: s.department?.id || '', program_id: s.program?.id || '',
        batch: s.batch || '', semester: s.semester || '', section: s.section || '',
        admission_date: s.admission_date || '', academic_status: s.academic_status, cgpa: s.cgpa || '',
    })
    showModal.value = true
}

const handleSubmit = async () => {
    errors.value = {}
    if (!form.name) { errors.value.name = 'Required'; return }
    if (!form.email) { errors.value.email = 'Required'; return }
    if (!form.student_id) { errors.value.student_id = 'Required'; return }
    if (!form.department_id) { errors.value.department_id = 'Required'; return }
    if (!form.program_id) { errors.value.program_id = 'Required'; return }

    saving.value = true
    try {
        if (editingStudent.value) {
            await api.put(`/students/${editingStudent.value.id}`, form)
            toast.add({ title: 'Student updated', color: 'green' })
        } else {
            await api.post('/students', form)
            toast.add({ title: 'Student created', color: 'green' })
        }
        showModal.value = false; fetchStudents(); fetchStats()
    } catch (err) {
        const errs = err?.data?.errors || {}
        errors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
        if (err?.data?.message) toast.add({ title: err.data.message, color: 'red' })
    } finally { saving.value = false }
}

const viewStudent = async (s) => {
    viewingStudent.value = s
    showViewModal.value = true
    // Fetch detailed view
    try {
        const res = await api.get(`/students/${s.id}`)
        viewingStudent.value = res.data
    } catch { }
}

const confirmDelete = (s) => { deletingStudent.value = s; showDeleteModal.value = true }

const handleDelete = async () => {
    deleting.value = true
    try {
        await api.delete(`/students/${deletingStudent.value.id}`)
        toast.add({ title: 'Student deleted', color: 'green' })
        showDeleteModal.value = false; fetchStudents(); fetchStats()
    } finally { deleting.value = false }
}

const changeAcademicStatus = async (s, status) => {
    try {
        await api.patch(`/students/${s.id}/status`, { academic_status: status })
        toast.add({ title: `Status updated to ${status}`, color: 'green' })
        if (viewingStudent.value?.id === s.id) viewingStudent.value = { ...viewingStudent.value, academic_status: status }
        fetchStudents(); fetchStats()
    } catch { }
}

const handleExport = async () => {
    exporting.value = true
    try {
        const token = localStorage.getItem('unicore_token')
        const config = useRuntimeConfig()
        const res = await fetch(`${config.public.apiBase}/students/export`, { headers: { Authorization: `Bearer ${token}` } })
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `students-${new Date().toISOString().slice(0, 10)}.xlsx`; a.click()
        URL.revokeObjectURL(url); toast.add({ title: 'Exported', color: 'green' })
    } finally { exporting.value = false }
}

onMounted(async () => {
    await Promise.all([fetchStudents(), fetchStats(), fetchDepartments(), fetchPrograms()])
})
</script>