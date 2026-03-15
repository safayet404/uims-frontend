<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Admissions</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage student applications and enrollment</p>
            </div>
            <button @click="openCreate"
                class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                <UIcon name="i-heroicons-plus" class="w-4 h-4" /> New Application
            </button>
        </div>

        <!-- Pipeline stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div v-for="s in pipeline" :key="s.key" @click="filterByStatus(s.key)"
                :class="['bg-white rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md', filters.status === s.key ? 'ring-2 ring-indigo-500' : 'border-gray-200']">
                <p :class="['text-xl font-bold', s.color]">{{ stats[s.key] || 0 }}</p>
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
                        placeholder="Search name, email, app number..."
                        class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                </div>
                <select v-model="filters.status" @change="fetchAdmissions"
                    class="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Status</option>
                    <option value="applied">Applied</option>
                    <option value="under_review">Under Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="enrolled">Enrolled</option>
                </select>
                <select v-model="filters.department_id" @change="fetchAdmissions"
                    class="w-44 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Departments</option>
                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} — {{ d.name }}</option>
                </select>
                <button v-if="filters.search || filters.status || filters.department_id" @click="clearFilters"
                    class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</button>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <div v-else-if="!admissions.length" class="p-12 text-center">
                <UIcon name="i-heroicons-document-plus" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 mb-3">No applications found</p>
                <button @click="openCreate"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">New
                    Application</button>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            App No.</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Department</th>
                        <th
                            class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            HSC GPA</th>
                        <th
                            class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Merit</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                            Semester</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="a in admissions" :key="a.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <div>
                                <p class="text-sm font-semibold text-gray-900">{{ a.full_name }}</p>
                                <p class="text-xs text-gray-400">{{ a.email }}</p>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <span class="text-xs font-mono text-indigo-700">{{ a.application_number }}</span>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <p class="text-xs font-medium text-gray-900">{{ a.department?.code }}</p>
                            <p class="text-xs text-gray-400">{{ a.hsc_group }}</p>
                        </td>
                        <td class="px-4 py-3 text-center hidden md:table-cell">
                            <span :class="['text-sm font-bold', gpaColor(a.hsc_gpa)]">{{ a.hsc_gpa }}</span>
                        </td>
                        <td class="px-4 py-3 text-center hidden lg:table-cell">
                            <span class="text-sm font-bold text-gray-700">{{ a.merit_score }}</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-500">{{ a.semester }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', statusColor(a.status)]">
                                {{ statusLabel(a.status) }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button @click="viewApplication(a)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    title="View">
                                    <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                                </button>
                                <button v-if="a.status === 'applied'" @click="quickAction(a, 'review')"
                                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Mark Under Review">
                                    <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
                                </button>
                                <button v-if="a.status === 'under_review'" @click="quickAction(a, 'shortlist')"
                                    class="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                    title="Shortlist">
                                    <UIcon name="i-heroicons-star" class="w-4 h-4" />
                                </button>
                                <button v-if="['under_review', 'shortlisted'].includes(a.status)" @click="openAccept(a)"
                                    class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                    title="Accept">
                                    <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
                                </button>
                                <button v-if="['applied', 'under_review', 'shortlisted'].includes(a.status)"
                                    @click="openReject(a)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Reject">
                                    <UIcon name="i-heroicons-x-circle" class="w-4 h-4" />
                                </button>
                                <button v-if="a.status === 'accepted'" @click="enrollApplicant(a)"
                                    class="px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                    title="Convert to Student">
                                    Enroll
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

        <!-- ── VIEW MODAL ── -->
        <Teleport to="body">
            <div v-if="showViewModal && viewingApp"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">{{ viewingApp.full_name }}</h3>
                            <p class="text-xs font-mono text-indigo-600">{{ viewingApp.application_number }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full', statusColor(viewingApp.status)]">{{
                                    statusLabel(viewingApp.status) }}</span>
                            <button @click="showViewModal = false"
                                class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div class="p-6 space-y-5">
                        <!-- Academic scores -->
                        <div class="grid grid-cols-3 gap-3">
                            <div class="bg-blue-50 rounded-xl p-3 text-center">
                                <p :class="['text-2xl font-bold', gpaColor(viewingApp.ssc_gpa)]">{{ viewingApp.ssc_gpa
                                }}</p>
                                <p class="text-xs text-gray-500 mt-0.5">SSC GPA</p>
                            </div>
                            <div class="bg-indigo-50 rounded-xl p-3 text-center">
                                <p :class="['text-2xl font-bold', gpaColor(viewingApp.hsc_gpa)]">{{ viewingApp.hsc_gpa
                                }}</p>
                                <p class="text-xs text-gray-500 mt-0.5">HSC GPA</p>
                            </div>
                            <div class="bg-purple-50 rounded-xl p-3 text-center">
                                <p class="text-2xl font-bold text-purple-700">{{ viewingApp.merit_score }}</p>
                                <p class="text-xs text-gray-500 mt-0.5">Merit Score</p>
                            </div>
                        </div>

                        <!-- Details grid -->
                        <div class="grid grid-cols-2 gap-3">
                            <div v-for="f in viewFields" :key="f.label" class="bg-gray-50 rounded-lg p-3">
                                <p class="text-xs text-gray-400 mb-0.5">{{ f.label }}</p>
                                <p class="text-sm font-medium text-gray-900">{{ f.value || '—' }}</p>
                            </div>
                        </div>

                        <!-- Academic background -->
                        <div class="bg-gray-50 rounded-xl p-4">
                            <p class="text-xs font-semibold text-gray-600 mb-3">Academic Background</p>
                            <div class="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p class="text-xs text-gray-400">SSC Board</p>
                                    <p class="font-medium">{{ viewingApp.ssc_board }} ({{ viewingApp.ssc_year }})</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-400">HSC Board</p>
                                    <p class="font-medium">{{ viewingApp.hsc_board }} ({{ viewingApp.hsc_year }})</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-400">HSC Group</p>
                                    <p class="font-medium">{{ viewingApp.hsc_group }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-400">Quota</p>
                                    <p class="font-medium capitalize">{{ viewingApp.quota || 'General' }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Guardian info -->
                        <div class="bg-gray-50 rounded-xl p-4">
                            <p class="text-xs font-semibold text-gray-600 mb-3">Guardian Information</p>
                            <div class="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p class="text-xs text-gray-400">Father</p>
                                    <p class="font-medium">{{ viewingApp.father_name || '—' }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-400">Mother</p>
                                    <p class="font-medium">{{ viewingApp.mother_name || '—' }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-400">Guardian Phone</p>
                                    <p class="font-medium">{{ viewingApp.guardian_phone || '—' }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-400">Family Income</p>
                                    <p class="font-medium">৳{{ viewingApp.family_income ?
                                        Number(viewingApp.family_income).toLocaleString() : '—' }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Rejection reason -->
                        <div v-if="viewingApp.rejection_reason" class="bg-red-50 rounded-xl p-4">
                            <p class="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
                            <p class="text-sm text-red-600">{{ viewingApp.rejection_reason }}</p>
                        </div>

                        <!-- Action buttons -->
                        <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                            <button v-if="viewingApp.status === 'applied'"
                                @click="quickAction(viewingApp, 'review'); showViewModal = false"
                                class="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">Mark
                                Under Review</button>
                            <button v-if="viewingApp.status === 'under_review'"
                                @click="quickAction(viewingApp, 'shortlist'); showViewModal = false"
                                class="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100">Shortlist</button>
                            <button v-if="['under_review', 'shortlisted'].includes(viewingApp.status)"
                                @click="showViewModal = false; openAccept(viewingApp)"
                                class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">Accept</button>
                            <button v-if="['applied', 'under_review', 'shortlisted'].includes(viewingApp.status)"
                                @click="showViewModal = false; openReject(viewingApp)"
                                class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">Reject</button>
                            <button v-if="viewingApp.status === 'accepted'"
                                @click="showViewModal = false; enrollApplicant(viewingApp)"
                                class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 ml-auto">Enroll
                                as Student</button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── CREATE/EDIT MODAL ── -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">New Application</h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-5">
                        <input type="text" style="display:none" autocomplete="username" />

                        <!-- Personal -->
                        <div>
                            <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal
                                Information</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                                    <input v-model="form.first_name" autocomplete="new-password"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                    <p v-if="errors.first_name" class="text-red-500 text-xs mt-1">{{ errors.first_name
                                    }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                                    <input v-model="form.last_name" autocomplete="new-password"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                                    <input v-model="form.email" type="text" inputmode="email"
                                        autocomplete="new-password"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                    <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                    <input v-model="form.phone" autocomplete="new-password"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                                    <select v-model="form.gender"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                                    <input v-model="form.date_of_birth" type="text" placeholder="YYYY-MM-DD"
                                        autocomplete="new-password"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                            </div>
                        </div>

                        <!-- Academic -->
                        <div>
                            <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic
                                Background</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">SSC GPA</label>
                                    <input v-model="form.ssc_gpa" type="number" step="0.01" min="0" max="5"
                                        autocomplete="new-password"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">HSC GPA</label>
                                    <input v-model="form.hsc_gpa" type="number" step="0.01" min="0" max="5"
                                        autocomplete="new-password"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">HSC Group</label>
                                    <select v-model="form.hsc_group"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select</option>
                                        <option value="Science">Science</option>
                                        <option value="Commerce">Commerce</option>
                                        <option value="Arts">Arts</option>
                                        <option value="Vocational">Vocational</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">HSC Year</label>
                                    <input v-model="form.hsc_year" autocomplete="new-password" placeholder="2024"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                            </div>
                        </div>

                        <!-- Application -->
                        <div>
                            <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Application
                                Details</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Department *</label>
                                    <select v-model="form.department_id"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select</option>
                                        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} — {{
                                            d.name }}</option>
                                    </select>
                                    <p v-if="errors.department_id" class="text-red-500 text-xs mt-1">{{
                                        errors.department_id }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Program</label>
                                    <select v-model="form.program_id"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                        <option value="">Select</option>
                                        <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.code }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Semester *</label>
                                    <input v-model="form.semester" autocomplete="new-password" placeholder="Spring 2025"
                                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Academic Year *</label>
                                    <input v-model="form.academic_year" autocomplete="new-password"
                                        placeholder="2024-2025"
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
                            {{ saving ? 'Submitting...' : 'Submit Application' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ACCEPT MODAL -->
        <Teleport to="body">
            <div v-if="showAcceptModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-green-700">Accept Application</h3>
                    </div>
                    <div class="p-6 space-y-3">
                        <p class="text-sm text-gray-600">Accept <strong>{{ acceptingApp?.full_name }}</strong>'s
                            application for <strong>{{ acceptingApp?.department?.code }}</strong>?</p>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Remarks (optional)</label>
                            <textarea v-model="acceptRemarks" rows="2"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 resize-none"></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showAcceptModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleAccept" :disabled="actioning"
                            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                            {{ actioning ? 'Accepting...' : 'Accept' }}
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
                        <h3 class="text-lg font-semibold text-red-600">Reject Application</h3>
                    </div>
                    <div class="p-6 space-y-3">
                        <p class="text-sm text-gray-600">Reject <strong>{{ rejectingApp?.full_name }}</strong>'s
                            application?</p>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Reason *</label>
                            <textarea v-model="rejectReason" rows="3" placeholder="Provide a reason for rejection..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 resize-none"></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showRejectModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleReject" :disabled="actioning"
                            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                            {{ actioning ? 'Rejecting...' : 'Reject' }}
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

ui.setPageTitle('Admissions')

const admissions = ref([])
const departments = ref([])
const programs = ref([])
const stats = ref({})
const loading = ref(false)
const saving = ref(false)
const actioning = ref(false)
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })

const showModal = ref(false)
const showViewModal = ref(false)
const showAcceptModal = ref(false)
const showRejectModal = ref(false)

const viewingApp = ref(null)
const acceptingApp = ref(null)
const rejectingApp = ref(null)
const acceptRemarks = ref('')
const rejectReason = ref('')
const errors = ref({})

const filters = reactive({ search: '', status: '', department_id: '', page: 1 })
const form = reactive({ first_name: '', last_name: '', email: '', phone: '', gender: '', date_of_birth: '', ssc_gpa: '', hsc_gpa: '', hsc_group: '', hsc_year: '', department_id: '', program_id: '', semester: 'Spring 2025', academic_year: '2024-2025' })

const pipeline = [
    { key: 'total', label: 'Total', color: 'text-gray-900' },
    { key: 'applied', label: 'Applied', color: 'text-blue-600' },
    { key: 'under_review', label: 'Reviewing', color: 'text-indigo-600' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'text-amber-600' },
    { key: 'accepted', label: 'Accepted', color: 'text-green-600' },
    { key: 'rejected', label: 'Rejected', color: 'text-red-600' },
    { key: 'enrolled', label: 'Enrolled', color: 'text-purple-600' },
]

const pageNumbers = computed(() => { const p = []; for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) p.push(i); return p })

const viewFields = computed(() => !viewingApp.value ? [] : [
    { label: 'Email', value: viewingApp.value.email },
    { label: 'Phone', value: viewingApp.value.phone },
    { label: 'Gender', value: viewingApp.value.gender },
    { label: 'DOB', value: viewingApp.value.date_of_birth },
    { label: 'Department', value: viewingApp.value.department?.name },
    { label: 'Program', value: viewingApp.value.program?.code },
    { label: 'Semester', value: viewingApp.value.semester },
    { label: 'Nationality', value: viewingApp.value.nationality },
    { label: 'Blood Group', value: viewingApp.value.blood_group },
    { label: 'Religion', value: viewingApp.value.religion },
])

const statusLabel = (s) => ({ applied: 'Applied', under_review: 'Under Review', shortlisted: 'Shortlisted', accepted: 'Accepted', rejected: 'Rejected', enrolled: 'Enrolled', cancelled: 'Cancelled' }[s] || s)
const statusColor = (s) => ({ applied: 'text-blue-700 bg-blue-50', under_review: 'text-indigo-700 bg-indigo-50', shortlisted: 'text-amber-700 bg-amber-50', accepted: 'text-green-700 bg-green-50', rejected: 'text-red-700 bg-red-50', enrolled: 'text-purple-700 bg-purple-50' }[s] || 'text-gray-600 bg-gray-100')
const gpaColor = (gpa) => !gpa ? 'text-gray-400' : gpa >= 4.5 ? 'text-green-600' : gpa >= 3.5 ? 'text-blue-600' : gpa >= 2.5 ? 'text-yellow-600' : 'text-red-600'

let searchTimer = null
const debouncedFetch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchAdmissions, 400) }

const filterByStatus = (key) => {
    filters.status = key === 'total' ? '' : (filters.status === key ? '' : key)
    fetchAdmissions()
}

const fetchAdmissions = async () => {
    loading.value = true
    try {
        const res = await api.get('/admissions', { search: filters.search || undefined, status: filters.status || undefined, department_id: filters.department_id || undefined, page: filters.page })
        admissions.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => { try { const r = await api.get('/admissions/stats'); stats.value = r.data || {} } catch { } }
const fetchDepartments = async () => { try { const r = await api.get('/departments', { all: true }); departments.value = r.data || [] } catch { } }
const fetchPrograms = async () => { try { const r = await api.get('/programs', { all: true }); programs.value = r.data || [] } catch { } }

const changePage = (p) => { filters.page = p; fetchAdmissions() }
const clearFilters = () => { Object.assign(filters, { search: '', status: '', department_id: '', page: 1 }); fetchAdmissions() }

const openCreate = () => {
    errors.value = {}
    Object.assign(form, { first_name: '', last_name: '', email: '', phone: '', gender: '', date_of_birth: '', ssc_gpa: '', hsc_gpa: '', hsc_group: '', hsc_year: '', department_id: '', program_id: '', semester: 'Spring 2025', academic_year: '2024-2025' })
    showModal.value = true
}

const handleSubmit = async () => {
    errors.value = {}
    if (!form.first_name) { errors.value.first_name = 'Required'; return }
    if (!form.email) { errors.value.email = 'Required'; return }
    if (!form.department_id) { errors.value.department_id = 'Required'; return }
    saving.value = true
    try {
        await api.post('/admissions', form)
        toast.add({ title: 'Application submitted', color: 'green' })
        showModal.value = false; fetchAdmissions(); fetchStats()
    } catch (err) {
        const errs = err?.data?.errors || {}
        errors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
        if (err?.data?.message) toast.add({ title: err.data.message, color: 'red' })
    } finally { saving.value = false }
}

const viewApplication = async (a) => {
    viewingApp.value = a; showViewModal.value = true
    try { const res = await api.get(`/admissions/${a.id}`); viewingApp.value = res.data } catch { }
}

const quickAction = async (a, action) => {
    try {
        await api.patch(`/admissions/${a.id}/${action}`)
        toast.add({ title: `Status updated`, color: 'green' })
        fetchAdmissions(); fetchStats()
    } catch { }
}

const openAccept = (a) => { acceptingApp.value = a; acceptRemarks.value = ''; showAcceptModal.value = true }
const openReject = (a) => { rejectingApp.value = a; rejectReason.value = ''; showRejectModal.value = true }

const handleAccept = async () => {
    actioning.value = true
    try {
        await api.patch(`/admissions/${acceptingApp.value.id}/accept`, { remarks: acceptRemarks.value })
        toast.add({ title: 'Application accepted', color: 'green' })
        showAcceptModal.value = false; fetchAdmissions(); fetchStats()
    } finally { actioning.value = false }
}

const handleReject = async () => {
    if (!rejectReason.value) { toast.add({ title: 'Provide a reason', color: 'red' }); return }
    actioning.value = true
    try {
        await api.patch(`/admissions/${rejectingApp.value.id}/reject`, { reason: rejectReason.value })
        toast.add({ title: 'Application rejected', color: 'green' })
        showRejectModal.value = false; fetchAdmissions(); fetchStats()
    } finally { actioning.value = false }
}

const enrollApplicant = async (a) => {
    if (!confirm(`Enroll ${a.full_name} as a student? This will create a user account and student profile.`)) return
    try {
        await api.post(`/admissions/${a.id}/enroll`)
        toast.add({ title: 'Student enrolled successfully!', description: 'Account created with default password: password', color: 'green' })
        fetchAdmissions(); fetchStats()
    } catch (err) {
        toast.add({ title: err?.data?.message || 'Enrollment failed', color: 'red' })
    }
}

onMounted(async () => {
    await Promise.all([fetchAdmissions(), fetchStats(), fetchDepartments(), fetchPrograms()])
})
</script>