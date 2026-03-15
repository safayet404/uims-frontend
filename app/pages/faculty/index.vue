<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Faculty</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage faculty members and their profiles</p>
            </div>
            <div class="flex gap-2">
                <button @click="handleExport" :disabled="exporting"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                    {{ exporting ? 'Exporting...' : 'Export' }}
                </button>
                <button @click="openCreate"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Faculty
                </button>
            </div>
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
                        placeholder="Search name, email, ID, specialization..."
                        class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                </div>
                <select v-model="filters.department_id" @change="fetchFaculty"
                    class="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Departments</option>
                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} — {{ d.name }}</option>
                </select>
                <select v-model="filters.designation" @change="fetchFaculty"
                    class="w-44 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Designations</option>
                    <option v-for="d in designations" :key="d" :value="d">{{ d }}</option>
                </select>
                <select v-model="filters.employment_status" @change="fetchFaculty"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="resigned">Resigned</option>
                    <option value="retired">Retired</option>
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
            <div v-else-if="!faculty.length" class="p-12 text-center">
                <UIcon name="i-heroicons-briefcase" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 mb-3">No faculty members found</p>
                <button @click="openCreate"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add
                    Faculty</button>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Faculty</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            ID</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Department</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Designation</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Specialization</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Publications</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="f in faculty" :key="f.id" class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                                <img :src="f.avatar_url" :alt="f.name"
                                    class="w-9 h-9 rounded-full object-cover shrink-0" />
                                <div class="min-w-0">
                                    <p class="text-sm font-semibold text-gray-900 truncate">{{ f.name }}</p>
                                    <p class="text-xs text-gray-400 truncate">{{ f.email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <span class="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{{
                                f.employee_id }}</span>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <span class="text-xs font-medium text-gray-700">{{ f.department?.code || '—' }}</span>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', designationColor(f.designation)]">{{
                                    f.designation }}</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-600 truncate max-w-36 block">{{ f.specialization || '—'
                            }}</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <div class="text-xs text-gray-600">
                                <span class="font-medium">{{ f.publications_count }}</span> pubs
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', employmentStatusClass(f.employment_status)]">
                                {{ f.employment_status }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button @click="viewFaculty(f)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                                </button>
                                <button @click="openEdit(f)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                </button>
                                <button @click="confirmDelete(f)"
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

        <!-- ── CREATE/EDIT MODAL ── -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingFaculty ? 'Edit Faculty' :
                            'Add Faculty Member' }}</h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-5">
                        <input type="text" style="display:none" autocomplete="username" />
                        <input type="password" style="display:none" autocomplete="new-password" />

                        <!-- Personal Info -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">Personal
                                Information</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                                    <input v-model="form.name" autocomplete="new-password" placeholder="Dr. John Smith"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                    <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                                    <input v-model="form.email" type="text" inputmode="email"
                                        autocomplete="new-password" placeholder="faculty@unicore.edu"
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
                                <div v-if="!editingFaculty">
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Password</label>
                                    <input v-model="form.password" type="password" autocomplete="new-password"
                                        placeholder="Default: password"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                            </div>
                        </div>

                        <!-- Professional Info -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">
                                Professional Information</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Employee ID *</label>
                                    <input v-model="form.employee_id" autocomplete="new-password" placeholder="FAC-001"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-mono" />
                                    <p v-if="errors.employee_id" class="text-red-500 text-xs mt-1">{{ errors.employee_id
                                    }}</p>
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
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Designation *</label>
                                    <select v-model="form.designation"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select designation</option>
                                        <option v-for="d in designations" :key="d" :value="d">{{ d }}</option>
                                    </select>
                                    <p v-if="errors.designation" class="text-red-500 text-xs mt-1">{{ errors.designation
                                    }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Employment Type</label>
                                    <select v-model="form.employment_type"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="visiting">Visiting</option>
                                        <option value="adjunct">Adjunct</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Specialization</label>
                                    <input v-model="form.specialization" autocomplete="new-password"
                                        placeholder="e.g. Machine Learning"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Highest Degree</label>
                                    <select v-model="form.highest_degree"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select degree</option>
                                        <option value="PhD">PhD</option>
                                        <option value="M.Phil">M.Phil</option>
                                        <option value="M.Sc">M.Sc</option>
                                        <option value="MBA">MBA</option>
                                        <option value="M.Eng">M.Eng</option>
                                        <option value="B.Sc">B.Sc</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Joining Date</label>
                                    <input v-model="form.joining_date" type="date"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div v-if="editingFaculty">
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Employment
                                        Status</label>
                                    <select v-model="form.employment_status"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="active">Active</option>
                                        <option value="on-leave">On Leave</option>
                                        <option value="resigned">Resigned</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Academic Stats (edit only) -->
                        <div v-if="editingFaculty">
                            <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">Academic
                                Stats</h4>
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Publications</label>
                                    <input v-model="form.publications_count" type="number" min="0"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Citations</label>
                                    <input v-model="form.citations_count" type="number" min="0"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">h-Index</label>
                                    <input v-model="form.h_index" type="number" step="0.1" min="0"
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
                            {{ saving ? 'Saving...' : (editingFaculty ? 'Save Changes' : 'Add Faculty') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── VIEW MODAL ── -->
        <Teleport to="body">
            <div v-if="showViewModal && viewingFaculty"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Faculty Profile</h3>
                        <button @click="showViewModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-5">
                        <!-- Header -->
                        <div class="flex items-center gap-4">
                            <img :src="viewingFaculty.avatar_url" :alt="viewingFaculty.name"
                                class="w-16 h-16 rounded-full object-cover" />
                            <div class="flex-1">
                                <h4 class="text-lg font-bold text-gray-900">{{ viewingFaculty.name }}</h4>
                                <p class="text-sm text-gray-500">{{ viewingFaculty.email }}</p>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    <span
                                        :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', designationColor(viewingFaculty.designation)]">{{
                                            viewingFaculty.designation }}</span>
                                    <span
                                        class="inline-flex px-2 py-0.5 text-xs font-mono font-medium text-indigo-700 bg-indigo-50 rounded">{{
                                            viewingFaculty.employee_id }}</span>
                                    <span
                                        :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', employmentStatusClass(viewingFaculty.employment_status)]">{{
                                            viewingFaculty.employment_status }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Academic stats -->
                        <div class="grid grid-cols-3 gap-3">
                            <div class="bg-indigo-50 rounded-xl p-3 text-center">
                                <p class="text-2xl font-bold text-indigo-700">{{ viewingFaculty.publications_count || 0
                                }}</p>
                                <p class="text-xs text-indigo-500 mt-0.5">Publications</p>
                            </div>
                            <div class="bg-blue-50 rounded-xl p-3 text-center">
                                <p class="text-2xl font-bold text-blue-700">{{ viewingFaculty.citations_count || 0 }}
                                </p>
                                <p class="text-xs text-blue-500 mt-0.5">Citations</p>
                            </div>
                            <div class="bg-purple-50 rounded-xl p-3 text-center">
                                <p class="text-2xl font-bold text-purple-700">{{ viewingFaculty.h_index || 0 }}</p>
                                <p class="text-xs text-purple-500 mt-0.5">h-Index</p>
                            </div>
                        </div>

                        <!-- Details -->
                        <div class="grid grid-cols-2 gap-3">
                            <div v-for="f in viewFields" :key="f.label" class="bg-gray-50 rounded-lg p-3">
                                <p class="text-xs text-gray-400 mb-0.5">{{ f.label }}</p>
                                <p class="text-sm font-medium text-gray-900">{{ f.value || '—' }}</p>
                            </div>
                        </div>

                        <!-- Research interests -->
                        <div v-if="viewingFaculty.research_interests" class="bg-gray-50 rounded-xl p-4">
                            <p class="text-xs font-semibold text-gray-600 mb-2">Research Interests</p>
                            <p class="text-sm text-gray-700">{{ viewingFaculty.research_interests }}</p>
                        </div>

                        <!-- Education -->
                        <div v-if="viewingFaculty.phd_institution" class="bg-gray-50 rounded-xl p-4">
                            <p class="text-xs font-semibold text-gray-600 mb-3">Education</p>
                            <div class="space-y-2">
                                <div v-if="viewingFaculty.phd_institution" class="flex items-center gap-2">
                                    <span
                                        class="text-xs font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">PhD</span>
                                    <span class="text-sm text-gray-800">{{ viewingFaculty.phd_institution }} ({{
                                        viewingFaculty.phd_year }})</span>
                                </div>
                                <div v-if="viewingFaculty.masters_institution" class="flex items-center gap-2">
                                    <span
                                        class="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">MS</span>
                                    <span class="text-sm text-gray-800">{{ viewingFaculty.masters_institution }} ({{
                                        viewingFaculty.masters_year }})</span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
                            <button v-if="viewingFaculty.employment_status !== 'active'"
                                @click="changeStatus(viewingFaculty, 'active')"
                                class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200">Set
                                Active</button>
                            <button v-if="viewingFaculty.employment_status !== 'on-leave'"
                                @click="changeStatus(viewingFaculty, 'on-leave')"
                                class="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200">On
                                Leave</button>
                            <button @click="() => { showViewModal = false; openEdit(viewingFaculty) }"
                                class="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 ml-auto">Edit</button>
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
                        <h3 class="text-lg font-semibold text-red-600">Delete Faculty</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-gray-600">Delete <strong>{{ deletingFaculty?.name }}</strong>? This will
                            also delete their user account.</p>
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

ui.setPageTitle('Faculty')

const faculty = ref([])
const departments = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const exporting = ref(false)
const stats = ref({})
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })

const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)

const editingFaculty = ref(null)
const viewingFaculty = ref(null)
const deletingFaculty = ref(null)
const errors = ref({})

const filters = reactive({ search: '', department_id: '', designation: '', employment_status: '', page: 1 })

const form = reactive({
    name: '', email: '', phone: '', gender: '', password: '',
    employee_id: '', department_id: '', designation: '', employment_type: 'full-time',
    specialization: '', highest_degree: '', joining_date: '', employment_status: 'active',
    publications_count: 0, citations_count: 0, h_index: '',
})

const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Senior Lecturer', 'Lecturer']

const hasFilters = computed(() => filters.search || filters.department_id || filters.designation || filters.employment_status)
const pageNumbers = computed(() => {
    const pages = []
    for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) pages.push(i)
    return pages
})
const statCards = computed(() => [
    { label: 'Total Faculty', value: stats.value.total || 0 },
    { label: 'Active', value: stats.value.active || 0 },
    { label: 'On Leave', value: stats.value.on_leave || 0 },
    { label: 'Full-time', value: stats.value.full_time || 0 },
])
const viewFields = computed(() => !viewingFaculty.value ? [] : [
    { label: 'Department', value: viewingFaculty.value.department?.name },
    { label: 'Employment Type', value: viewingFaculty.value.employment_type },
    { label: 'Specialization', value: viewingFaculty.value.specialization },
    { label: 'Highest Degree', value: viewingFaculty.value.highest_degree },
    { label: 'Joining Date', value: viewingFaculty.value.joining_date },
    { label: 'Office Room', value: viewingFaculty.value.office_room },
    { label: 'Office Phone', value: viewingFaculty.value.office_phone },
    { label: 'Google Scholar', value: viewingFaculty.value.google_scholar },
])

const designationColor = (d) => ({
    'Professor': 'text-purple-700 bg-purple-50',
    'Associate Professor': 'text-blue-700 bg-blue-50',
    'Assistant Professor': 'text-indigo-700 bg-indigo-50',
    'Senior Lecturer': 'text-green-700 bg-green-50',
    'Lecturer': 'text-gray-700 bg-gray-100',
}[d] || 'text-gray-700 bg-gray-100')

const employmentStatusClass = (s) => ({
    active: 'text-green-700 bg-green-50',
    'on-leave': 'text-yellow-700 bg-yellow-50',
    resigned: 'text-red-700 bg-red-50',
    retired: 'text-gray-600 bg-gray-100',
}[s] || 'text-gray-600 bg-gray-100')

let searchTimer = null
const debouncedFetch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchFaculty, 400) }

const fetchFaculty = async () => {
    loading.value = true
    try {
        const res = await api.get('/faculty', {
            search: filters.search || undefined,
            department_id: filters.department_id || undefined,
            designation: filters.designation || undefined,
            employment_status: filters.employment_status || undefined,
            page: filters.page,
        })
        faculty.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => {
    try { const res = await api.get('/faculty/stats'); stats.value = res.data || {} } catch { }
}

const fetchDepartments = async () => {
    try { const res = await api.get('/departments', { all: true }); departments.value = res.data || [] } catch { }
}

const changePage = (p) => { filters.page = p; fetchFaculty() }
const clearFilters = () => { Object.assign(filters, { search: '', department_id: '', designation: '', employment_status: '', page: 1 }); fetchFaculty() }

const openCreate = () => {
    editingFaculty.value = null; errors.value = {}
    Object.assign(form, { name: '', email: '', phone: '', gender: '', password: '', employee_id: '', department_id: '', designation: '', employment_type: 'full-time', specialization: '', highest_degree: '', joining_date: '', employment_status: 'active', publications_count: 0, citations_count: 0, h_index: '' })
    showModal.value = true
}

const openEdit = (f) => {
    editingFaculty.value = f; errors.value = {}
    Object.assign(form, {
        name: f.name, email: f.email, phone: f.phone || '', gender: f.gender || '', password: '',
        employee_id: f.employee_id, department_id: f.department?.id || '', designation: f.designation,
        employment_type: f.employment_type, specialization: f.specialization || '',
        highest_degree: f.highest_degree || '', joining_date: f.joining_date || '',
        employment_status: f.employment_status, publications_count: f.publications_count || 0,
        citations_count: f.citations_count || 0, h_index: f.h_index || '',
    })
    showModal.value = true
}

const handleSubmit = async () => {
    errors.value = {}
    if (!form.name) { errors.value.name = 'Required'; return }
    if (!form.email) { errors.value.email = 'Required'; return }
    if (!form.employee_id) { errors.value.employee_id = 'Required'; return }
    if (!form.department_id) { errors.value.department_id = 'Required'; return }
    if (!form.designation) { errors.value.designation = 'Required'; return }
    saving.value = true
    try {
        editingFaculty.value ? await api.put(`/faculty/${editingFaculty.value.id}`, form) : await api.post('/faculty', form)
        toast.add({ title: editingFaculty.value ? 'Faculty updated' : 'Faculty created', color: 'green' })
        showModal.value = false; fetchFaculty(); fetchStats()
    } catch (err) {
        const errs = err?.data?.errors || {}
        errors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
        if (err?.data?.message) toast.add({ title: err.data.message, color: 'red' })
    } finally { saving.value = false }
}

const viewFaculty = async (f) => {
    viewingFaculty.value = f; showViewModal.value = true
    try { const res = await api.get(`/faculty/${f.id}`); viewingFaculty.value = res.data } catch { }
}

const confirmDelete = (f) => { deletingFaculty.value = f; showDeleteModal.value = true }

const handleDelete = async () => {
    deleting.value = true
    try {
        await api.delete(`/faculty/${deletingFaculty.value.id}`)
        toast.add({ title: 'Faculty deleted', color: 'green' })
        showDeleteModal.value = false; fetchFaculty(); fetchStats()
    } finally { deleting.value = false }
}

const changeStatus = async (f, status) => {
    try {
        await api.patch(`/faculty/${f.id}/status`, { employment_status: status })
        toast.add({ title: `Status updated to ${status}`, color: 'green' })
        if (viewingFaculty.value?.id === f.id) viewingFaculty.value = { ...viewingFaculty.value, employment_status: status }
        fetchFaculty(); fetchStats()
    } catch { }
}

const handleExport = async () => {
    exporting.value = true
    try {
        const token = localStorage.getItem('unicore_token')
        const config = useRuntimeConfig()
        const res = await fetch(`${config.public.apiBase}/faculty/export`, { headers: { Authorization: `Bearer ${token}` } })
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `faculty-${new Date().toISOString().slice(0, 10)}.xlsx`; a.click()
        URL.revokeObjectURL(url); toast.add({ title: 'Exported', color: 'green' })
    } finally { exporting.value = false }
}

onMounted(async () => {
    await Promise.all([fetchFaculty(), fetchStats(), fetchDepartments()])
})
</script>