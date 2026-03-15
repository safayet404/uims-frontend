<template>
    <div class="space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Users</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage all system users and their roles</p>
            </div>
            <div class="flex gap-2">
                <button @click="handleExport" :disabled="exporting"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                    {{ exporting ? 'Exporting...' : 'Export' }}
                </button>
                <button @click="openCreate"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                    Add User
                </button>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                    <input autocomplete="new-password" name="unicore_search" type="search" v-model="filters.search"
                        @input="debouncedFetch" placeholder="Search name, email, ID..."
                        class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <select v-model="filters.role" @change="fetchUsers"
                    class="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Roles</option>
                    <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
                </select>
                <select v-model="filters.status" @change="fetchUsers"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>
                <button v-if="hasFilters" @click="clearFilters"
                    class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</button>
            </div>
        </div>

        <!-- Bulk actions -->
        <div v-if="selected.length"
            class="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-3">
            <span class="text-sm font-medium text-indigo-700">{{ selected.length }} selected</span>
            <div class="flex gap-2 ml-auto">
                <button @click="bulkAction('activate')"
                    class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200">Activate</button>
                <button @click="bulkAction('deactivate')"
                    class="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200">Deactivate</button>
                <button @click="bulkAction('suspend')"
                    class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200">Suspend</button>
                <button @click="bulkAction('delete')"
                    class="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50">Delete</button>
                <button @click="selected = []"
                    class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800">Cancel</button>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                </div>
            </div>
            <div v-else-if="!users.length" class="p-12 text-center">
                <UIcon name="i-heroicons-users" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 mb-3">No users found</p>
                <button @click="openCreate"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add
                    First User</button>
            </div>
            <table v-else class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="w-10 px-4 py-3"><input type="checkbox" :checked="allSelected" @change="toggleAll"
                                class="rounded border-gray-300" /></th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            User</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Role</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            ID</th>
                        <th
                            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Last Login</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-3"><input type="checkbox" :value="user.id" v-model="selected"
                                class="rounded border-gray-300" /></td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                                <img :src="user.avatar_url" :alt="user.name"
                                    class="w-8 h-8 rounded-full object-cover shrink-0" />
                                <div class="min-w-0">
                                    <p class="text-sm font-semibold text-gray-900 truncate">{{ user.name }}</p>
                                    <p class="text-xs text-gray-400 truncate">{{ user.email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3 hidden sm:table-cell">
                            <span
                                class="inline-flex px-2 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full capitalize">{{
                                    user.roles[0] || 'none' }}</span>
                        </td>
                        <td class="px-4 py-3 hidden md:table-cell">
                            <span class="text-xs text-gray-500 font-mono">{{ user.employee_id || user.student_id || '—'
                            }}</span>
                        </td>
                        <td class="px-4 py-3 hidden lg:table-cell">
                            <span class="text-xs text-gray-500">{{ user.last_login_at ? formatDate(user.last_login_at) :
                                'Never' }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', statusClass(user.status)]">{{
                                    user.status }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button @click="viewUser(user)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                                </button>
                                <button @click="openEdit(user)"
                                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                </button>
                                <button @click="confirmDelete(user)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
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

        <!-- CREATE/EDIT MODAL -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingUser ? 'Edit User' : 'Add New User' }}
                        </h3>
                        <button @click="showModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input v-model="form.name" autocomplete="off" placeholder="John Doe"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900" />
                                <p v-if="formErrors.name" class="text-red-500 text-xs mt-1">{{ formErrors.name }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input v-model="form.email" type="email" autocomplete="off"
                                    placeholder="user@unicore.edu"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900" />
                                <p v-if="formErrors.email" class="text-red-500 text-xs mt-1">{{ formErrors.email }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input v-model="form.phone" autocomplete="off" placeholder="+880..."
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                <select v-model="form.role"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Select role</option>
                                    <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
                                </select>
                                <p v-if="formErrors.role" class="text-red-500 text-xs mt-1">{{ formErrors.role }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select v-model="form.gender"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select v-model="form.status"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                <input v-model="form.employee_id" placeholder="EMP-001"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                <input v-model="form.student_id" placeholder="212-0136-006" maxlength="12"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 font-mono" />
                                <p class="text-xs text-gray-400 mt-1">Format: YYS-SSSS-DDD (Year+Semester · Serial ·
                                    Dept code)</p>
                            </div>
                            <div v-if="!editingUser" class="col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input autocomplete="off" v-model="form.password" type="password"
                                    placeholder="Min 8 characters"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900" />
                                <p v-if="formErrors.password" class="text-red-500 text-xs mt-1">{{ formErrors.password
                                }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSubmit" :disabled="saving"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {{ saving ? 'Saving...' : (editingUser ? 'Save Changes' : 'Create User') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- VIEW MODAL -->
        <Teleport to="body">
            <div v-if="showViewModal && viewingUser"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">User Profile</h3>
                        <button @click="showViewModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-5">
                        <div class="flex items-center gap-4">
                            <img :src="viewingUser.avatar_url" :alt="viewingUser.name"
                                class="w-16 h-16 rounded-full object-cover" />
                            <div>
                                <h4 class="text-lg font-bold text-gray-900">{{ viewingUser.name }}</h4>
                                <p class="text-sm text-gray-500">{{ viewingUser.email }}</p>
                                <div class="flex gap-2 mt-2">
                                    <span
                                        class="inline-flex px-2 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full capitalize">{{
                                            viewingUser.roles?.[0] }}</span>
                                    <span
                                        :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', statusClass(viewingUser.status)]">{{
                                            viewingUser.status }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div v-for="f in userFields" :key="f.label" class="bg-gray-50 rounded-lg p-3">
                                <p class="text-xs text-gray-400 mb-0.5">{{ f.label }}</p>
                                <p class="text-sm font-medium text-gray-900">{{ f.value || '—' }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
                            <button v-if="viewingUser.status !== 'active'" @click="changeStatus(viewingUser, 'active')"
                                class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200">Activate</button>
                            <button v-if="viewingUser.status !== 'suspended'"
                                @click="changeStatus(viewingUser, 'suspended')"
                                class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200">Suspend</button>
                            <button @click="openResetPassword(viewingUser)"
                                class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Reset
                                Password</button>
                            <button @click="() => { showViewModal = false; openEdit(viewingUser) }"
                                class="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 ml-auto">Edit</button>
                        </div>
                        <div>
                            <h5 class="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h5>
                            <div class="space-y-1 max-h-48 overflow-y-auto">
                                <div v-for="log in userActivity" :key="log.id"
                                    class="flex items-center gap-3 text-xs py-1.5 border-b border-gray-50">
                                    <span class="text-gray-400 whitespace-nowrap w-36 shrink-0">{{
                                        formatDate(log.created_at) }}</span>
                                    <span class="flex-1 text-gray-700 truncate">{{ log.description }}</span>
                                    <span class="text-gray-400 font-mono">{{ log.ip_address }}</span>
                                </div>
                                <p v-if="!userActivity.length" class="text-gray-400 text-center py-3 text-xs">No
                                    activity yet</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- RESET PASSWORD MODAL -->
        <Teleport to="body">
            <div v-if="showResetModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Reset Password</h3>
                        <button @click="showResetModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <p class="text-sm text-gray-600">Set a new password for <strong>{{ resetUser?.name }}</strong>
                        </p>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input v-model="newPassword" type="password" placeholder="Min 8 characters"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input v-model="newPasswordConfirm" type="password" placeholder="Repeat password"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showResetModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleResetPassword" :disabled="resetting"
                            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                            {{ resetting ? 'Resetting...' : 'Reset Password' }}
                        </button>
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
                        <h3 class="text-lg font-semibold text-red-600">Delete User</h3>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-gray-600">Are you sure you want to delete <strong>{{ deletingUser?.name
                        }}</strong>? This action cannot be undone.</p>
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
import dayjs from 'dayjs'
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const ui = useUiStore()
const api = useApi()
const toast = useToast()

ui.setPageTitle('Users')

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const resetting = ref(false)
const exporting = ref(false)
const selected = ref([])
const stats = ref({})
const pagination = ref({ total: 0, current_page: 1, last_page: 1 })
const userActivity = ref([])

const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const showResetModal = ref(false)

const editingUser = ref(null)
const viewingUser = ref(null)
const deletingUser = ref(null)
const resetUser = ref(null)
const newPassword = ref('')
const newPasswordConfirm = ref('')
const formErrors = ref({})

const filters = reactive({ search: '', role: '', status: '', page: 1 })
const form = reactive({ name: '', email: '', phone: '', role: '', gender: '', status: 'active', employee_id: '', student_id: '', password: '' })

const roles = [
    { label: 'Super Admin', value: 'super-admin' },
    { label: 'Admin', value: 'admin' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Student', value: 'student' },
    { label: 'Staff', value: 'staff' },
    { label: 'Librarian', value: 'librarian' },
    { label: 'Accountant', value: 'accountant' },
    { label: 'Admission Officer', value: 'admission-officer' },
]

const hasFilters = computed(() => filters.search || filters.role || filters.status)
const allSelected = computed(() => users.value.length > 0 && selected.value.length === users.value.length)
const statCards = computed(() => [
    { label: 'Total Users', value: stats.value.total || 0 },
    { label: 'Active', value: stats.value.active || 0 },
    { label: 'Inactive', value: stats.value.inactive || 0 },
    { label: 'Suspended', value: stats.value.suspended || 0 },
])
const pageNumbers = computed(() => {
    const pages = []
    for (let i = Math.max(1, pagination.value.current_page - 2); i <= Math.min(pagination.value.last_page, pagination.value.current_page + 2); i++) pages.push(i)
    return pages
})
const userFields = computed(() => !viewingUser.value ? [] : [
    { label: 'Phone', value: viewingUser.value.phone },
    { label: 'Gender', value: viewingUser.value.gender },
    { label: 'Employee ID', value: viewingUser.value.employee_id },
    { label: 'Student ID', value: viewingUser.value.student_id },
    { label: 'City', value: viewingUser.value.city },
    { label: 'Country', value: viewingUser.value.country },
    { label: 'Last Login', value: viewingUser.value.last_login_at ? formatDate(viewingUser.value.last_login_at) : null },
    { label: 'Last IP', value: viewingUser.value.last_login_ip },
])

const formatDate = (d) => dayjs(d).format('MMM D, YYYY HH:mm')
const statusClass = (s) => ({ active: 'text-green-700 bg-green-50', inactive: 'text-gray-600 bg-gray-100', suspended: 'text-red-700 bg-red-50' }[s] || 'text-gray-600 bg-gray-100')

let searchTimer = null
const debouncedFetch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchUsers, 400) }

const fetchUsers = async () => {
    loading.value = true
    try {
        const res = await api.get('/users', { search: filters.search || undefined, role: filters.role || undefined, status: filters.status || undefined, page: filters.page })
        users.value = res.data || []
        pagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loading.value = false }
}

const fetchStats = async () => {
    try { const res = await api.get('/users/stats'); stats.value = res.data || {} } catch { }
}

const changePage = (p) => { filters.page = p; fetchUsers() }
const toggleAll = (e) => { selected.value = e.target.checked ? users.value.map(u => u.id) : [] }
const clearFilters = () => { filters.search = ''; filters.role = ''; filters.status = ''; filters.page = 1; fetchUsers() }

const openCreate = () => {
    editingUser.value = null; formErrors.value = {}
    Object.assign(form, { name: '', email: '', phone: '', role: '', gender: '', status: 'active', employee_id: '', student_id: '', password: '' })
    showModal.value = true
}

const openEdit = (user) => {
    editingUser.value = user; formErrors.value = {}
    Object.assign(form, { name: user.name, email: user.email, phone: user.phone || '', role: user.roles?.[0] || '', gender: user.gender || '', status: user.status, employee_id: user.employee_id || '', student_id: user.student_id || '', password: '' })
    showModal.value = true
}

const handleSubmit = async () => {
    formErrors.value = {}
    if (!form.name) { formErrors.value.name = 'Required'; return }
    if (!form.email) { formErrors.value.email = 'Required'; return }
    if (!form.role) { formErrors.value.role = 'Required'; return }
    if (!editingUser.value && !form.password) { formErrors.value.password = 'Required'; return }
    saving.value = true
    try {
        editingUser.value ? await api.put(`/users/${editingUser.value.id}`, form) : await api.post('/users', form)
        toast.add({ title: editingUser.value ? 'User updated' : 'User created', color: 'green' })
        showModal.value = false; fetchUsers(); fetchStats()
    } catch (err) {
        const errs = err?.data?.errors || {}
        formErrors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
    } finally { saving.value = false }
}

const viewUser = async (user) => {
    viewingUser.value = user; showViewModal.value = true; userActivity.value = []
    try { const res = await api.get(`/users/${user.id}/activity`); userActivity.value = res.data || [] } catch { }
}

const confirmDelete = (user) => { deletingUser.value = user; showDeleteModal.value = true }

const handleDelete = async () => {
    deleting.value = true
    try {
        await api.delete(`/users/${deletingUser.value.id}`)
        toast.add({ title: 'User deleted', color: 'green' })
        showDeleteModal.value = false; fetchUsers(); fetchStats()
    } finally { deleting.value = false }
}

const changeStatus = async (user, status) => {
    try {
        await api.patch(`/users/${user.id}/status`, { status })
        toast.add({ title: `User ${status}`, color: 'green' })
        if (viewingUser.value?.id === user.id) viewingUser.value = { ...viewingUser.value, status }
        fetchUsers()
    } catch { }
}

const openResetPassword = (user) => {
    resetUser.value = user; newPassword.value = ''; newPasswordConfirm.value = ''; showResetModal.value = true
}

const handleResetPassword = async () => {
    if (newPassword.value !== newPasswordConfirm.value) { toast.add({ title: 'Passwords do not match', color: 'red' }); return }
    resetting.value = true
    try {
        await api.post(`/users/${resetUser.value.id}/reset-password`, { password: newPassword.value, password_confirmation: newPasswordConfirm.value })
        toast.add({ title: 'Password reset', color: 'green' }); showResetModal.value = false
    } finally { resetting.value = false }
}

const bulkAction = async (action) => {
    if (!confirm(`${action} ${selected.value.length} users?`)) return
    try {
        await api.post('/users/bulk-action', { action, user_ids: selected.value })
        toast.add({ title: `Bulk ${action} done`, color: 'green' })
        selected.value = []; fetchUsers(); fetchStats()
    } catch { }
}

const handleExport = async () => {
    exporting.value = true
    try {
        const token = localStorage.getItem('unicore_token')
        const config = useRuntimeConfig()
        const res = await fetch(`${config.public.apiBase}/users/export`, { headers: { Authorization: `Bearer ${token}` } })
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `users-${new Date().toISOString().slice(0, 10)}.xlsx`; a.click()
        URL.revokeObjectURL(url); toast.add({ title: 'Exported', color: 'green' })
    } finally { exporting.value = false }
}

onMounted(() => { fetchUsers(); fetchStats() })
</script>