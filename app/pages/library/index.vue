<template>
    <div class="space-y-5">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Library</h2>
                <p class="text-sm text-gray-500 mt-0.5">Manage books, members and borrowing</p>
            </div>
            <div class="flex gap-2">
                <button v-if="activeTab === 'books'" @click="openAddBook"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Add Book
                </button>
                <button v-if="activeTab === 'issues'" @click="showIssueModal = true"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4" /> Issue Book
                </button>
                <button v-if="activeTab === 'members'" @click="showMemberModal = true"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <UIcon name="i-heroicons-user-plus" class="w-4 h-4" /> Add Member
                </button>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.total_titles || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Total Titles</p>
                <p class="text-xs text-indigo-500 mt-0.5">{{ stats.total_books || 0 }} copies</p>
            </div>
            <div class="bg-green-50 rounded-xl border border-green-200 p-4">
                <p class="text-2xl font-bold text-green-600">{{ stats.available_books || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Available</p>
            </div>
            <div class="bg-amber-50 rounded-xl border border-amber-200 p-4">
                <p class="text-2xl font-bold text-amber-600">{{ stats.currently_issued || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Issued</p>
                <p v-if="stats.overdue" class="text-xs text-red-500 mt-0.5">{{ stats.overdue }} overdue</p>
            </div>
            <div class="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
                <p class="text-2xl font-bold text-indigo-600">{{ stats.total_members || 0 }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Active Members</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                :class="['px-4 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']">
                {{ tab.label }}
            </button>
        </div>

        <!-- BOOKS TAB -->
        <div v-if="activeTab === 'books'" class="space-y-4">
            <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
                <div class="flex-1 min-w-48 relative">
                    <UIcon name="i-heroicons-magnifying-glass"
                        class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input v-model="bookFilters.search" @input="debouncedFetchBooks" type="search"
                        autocomplete="new-password" placeholder="Title, author, ISBN..."
                        class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                </div>
                <select v-model="bookFilters.category" @change="fetchBooks"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Categories</option>
                    <option value="textbook">Textbook</option>
                    <option value="reference">Reference</option>
                    <option value="fiction">Fiction</option>
                    <option value="journal">Journal</option>
                    <option value="thesis">Thesis</option>
                    <option value="magazine">Magazine</option>
                    <option value="other">Other</option>
                </select>
                <select v-model="bookFilters.department_id" @change="fetchBooks"
                    class="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Departments</option>
                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }}</option>
                </select>
                <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" v-model="bookFilters.available" @change="fetchBooks" class="rounded" />
                    Available only
                </label>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div v-if="loadingBooks" class="p-8 text-center">
                    <div
                        class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                    </div>
                </div>
                <table v-else class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Book</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                                Author</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Category</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Shelf</th>
                            <th
                                class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                                Copies</th>
                            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Avail.</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="b in books" :key="b.id" class="hover:bg-gray-50">
                            <td class="px-4 py-3">
                                <p class="text-sm font-semibold text-gray-900">{{ b.title }}</p>
                                <p v-if="b.isbn" class="text-xs font-mono text-gray-400">{{ b.isbn }}</p>
                            </td>
                            <td class="px-4 py-3 hidden sm:table-cell">
                                <p class="text-xs text-gray-600">{{ b.author }}</p>
                                <p class="text-xs text-gray-400">{{ b.publish_year }}</p>
                            </td>
                            <td class="px-4 py-3 hidden md:table-cell"><span
                                    :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', categoryColor(b.category)]">{{
                                        b.category }}</span></td>
                            <td class="px-4 py-3 hidden md:table-cell"><span class="text-xs font-mono text-gray-600">{{
                                b.shelf_location || '—' }}</span></td>
                            <td class="px-4 py-3 text-center hidden lg:table-cell"><span
                                    class="text-sm font-medium text-gray-700">{{ b.total_copies }}</span></td>
                            <td class="px-4 py-3 text-center"><span
                                    :class="['text-sm font-bold', b.available_copies > 0 ? 'text-green-600' : 'text-red-500']">{{
                                        b.available_copies }}</span></td>
                            <td class="px-4 py-3">
                                <div class="flex items-center justify-end gap-1">
                                    <button @click="openEditBook(b)"
                                        class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                        <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                    </button>
                                    <button @click="deleteBook(b)"
                                        class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="!books.length">
                            <td colspan="7" class="px-4 py-12 text-center text-gray-400 text-sm">No books found</td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="bookPagination.last_page > 1"
                    class="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                    <p class="text-sm text-gray-500">{{ bookPagination.total }} titles</p>
                    <div class="flex gap-1">
                        <button @click="changeBookPage(bookPagination.current_page - 1)"
                            :disabled="bookPagination.current_page === 1"
                            class="px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40">‹</button>
                        <button v-for="p in bookPageNumbers" :key="p" @click="changeBookPage(p)"
                            :class="['px-3 py-1 text-sm rounded', p === bookPagination.current_page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100']">{{
                                p }}</button>
                        <button @click="changeBookPage(bookPagination.current_page + 1)"
                            :disabled="bookPagination.current_page === bookPagination.last_page"
                            class="px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40">›</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ISSUES TAB -->
        <div v-if="activeTab === 'issues'" class="space-y-4">
            <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
                <select v-model="issueFilters.status" @change="fetchIssues"
                    class="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">All Status</option>
                    <option value="issued">Issued</option>
                    <option value="returned">Returned</option>
                    <option value="overdue">Overdue</option>
                </select>
                <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" v-model="issueFilters.overdue" @change="fetchIssues" class="rounded" />
                    Overdue only
                </label>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div v-if="loadingIssues" class="p-8 text-center">
                    <div
                        class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                    </div>
                </div>
                <table v-else class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Book</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                                Member</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Issued</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Due</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                                Fine</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="issue in issues" :key="issue.id"
                            :class="['hover:bg-gray-50', issue.status === 'overdue' ? 'bg-red-50/30' : '']">
                            <td class="px-4 py-3">
                                <p class="text-sm font-semibold text-gray-900 truncate max-w-36">{{ issue.book?.title }}
                                </p>
                                <p class="text-xs text-gray-400">{{ issue.book?.isbn }}</p>
                            </td>
                            <td class="px-4 py-3 hidden sm:table-cell">
                                <div class="flex items-center gap-2">
                                    <img :src="issue.member?.avatar_url" class="w-6 h-6 rounded-full object-cover" />
                                    <div>
                                        <p class="text-xs font-medium text-gray-900">{{ issue.member?.name }}</p>
                                        <p class="text-xs font-mono text-gray-400">{{ issue.member?.member_id }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3 hidden md:table-cell"><span class="text-xs text-gray-600">{{
                                issue.issue_date }}</span></td>
                            <td class="px-4 py-3 hidden md:table-cell">
                                <span
                                    :class="['text-xs font-medium', issue.status === 'overdue' ? 'text-red-600' : 'text-gray-600']">{{
                                        issue.due_date }}</span>
                                <p v-if="issue.days_overdue > 0" class="text-xs text-red-500">{{ issue.days_overdue }}d
                                    overdue</p>
                            </td>
                            <td class="px-4 py-3 hidden lg:table-cell">
                                <div v-if="issue.fine_amount > 0 || issue.estimated_fine > 0">
                                    <p class="text-xs font-bold text-red-600">৳{{ issue.fine_amount > 0 ?
                                        issue.fine_amount : issue.estimated_fine }}</p>
                                    <p v-if="issue.fine_paid" class="text-xs text-green-600">Paid</p>
                                </div>
                                <span v-else class="text-xs text-gray-300">—</span>
                            </td>
                            <td class="px-4 py-3"><span
                                    :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', issueStatusColor(issue.status)]">{{
                                        issue.status }}</span></td>
                            <td class="px-4 py-3 text-right">
                                <button v-if="issue.status !== 'returned'" @click="openReturn(issue)"
                                    class="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Return</button>
                            </td>
                        </tr>
                        <tr v-if="!issues.length">
                            <td colspan="7" class="px-4 py-12 text-center text-gray-400 text-sm">No issues found</td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="issuePagination.last_page > 1"
                    class="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                    <p class="text-sm text-gray-500">{{ issuePagination.total }} records</p>
                    <div class="flex gap-1">
                        <button @click="changeIssuePage(issuePagination.current_page - 1)"
                            :disabled="issuePagination.current_page === 1"
                            class="px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40">‹</button>
                        <button v-for="p in issuePageNumbers" :key="p" @click="changeIssuePage(p)"
                            :class="['px-3 py-1 text-sm rounded', p === issuePagination.current_page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100']">{{
                                p }}</button>
                        <button @click="changeIssuePage(issuePagination.current_page + 1)"
                            :disabled="issuePagination.current_page === issuePagination.last_page"
                            class="px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40">›</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MEMBERS TAB -->
        <div v-if="activeTab === 'members'" class="space-y-4">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div v-if="loadingMembers" class="p-8 text-center">
                    <div
                        class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto">
                    </div>
                </div>
                <table v-else class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Member</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                                ID</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Type</th>
                            <th
                                class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                                Max Books</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                                Expires</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="m in members" :key="m.id" class="hover:bg-gray-50">
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-2">
                                    <img :src="m.user?.avatar_url" class="w-8 h-8 rounded-full object-cover" />
                                    <div>
                                        <p class="text-sm font-semibold text-gray-900">{{ m.user?.name }}</p>
                                        <p class="text-xs text-gray-400">{{ m.user?.email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3 hidden sm:table-cell"><span
                                    class="text-xs font-mono text-indigo-700">{{ m.member_id }}</span></td>
                            <td class="px-4 py-3 hidden md:table-cell"><span
                                    class="text-xs font-medium capitalize text-gray-700">{{ m.member_type }}</span></td>
                            <td class="px-4 py-3 text-center hidden md:table-cell"><span
                                    class="text-sm font-bold text-gray-700">{{ m.max_books }}</span></td>
                            <td class="px-4 py-3 hidden lg:table-cell"><span class="text-xs text-gray-500">{{
                                m.membership_end }}</span></td>
                            <td class="px-4 py-3"><span
                                    :class="['inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', m.status === 'active' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50']">{{
                                        m.status }}</span></td>
                        </tr>
                        <tr v-if="!members.length">
                            <td colspan="6" class="px-4 py-12 text-center text-gray-400 text-sm">No members found</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ISSUE BOOK MODAL -->
        <Teleport to="body">
            <div v-if="showIssueModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Issue Book</h3>
                        <button @click="showIssueModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <input type="text" style="display:none" autocomplete="username" />
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Member *</label>
                            <input v-model="issueForm.memberSearch" @input="searchMembersForIssue" type="search"
                                autocomplete="new-password" placeholder="Search by name or member ID..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            <div v-if="memberResults.length"
                                class="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <button v-for="m in memberResults" :key="m.id" @click="selectMember(m)"
                                    class="w-full flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 text-left border-b border-gray-50 last:border-0">
                                    <img :src="m.user?.avatar_url" class="w-7 h-7 rounded-full" />
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">{{ m.user?.name }}</p>
                                        <p class="text-xs font-mono text-gray-400">{{ m.member_id }}</p>
                                    </div>
                                </button>
                            </div>
                            <div v-if="issueForm.library_member_id"
                                class="mt-2 flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-indigo-600" />
                                <span class="text-sm text-indigo-700">{{ issueForm.selectedMemberName }}</span>
                                <button @click="issueForm.library_member_id = ''; issueForm.selectedMemberName = ''"
                                    class="ml-auto text-gray-400">
                                    <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Book *</label>
                            <input v-model="issueForm.bookSearch" @input="searchBooksForIssue" type="search"
                                autocomplete="new-password" placeholder="Search by title, author or ISBN..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            <div v-if="bookResults.length"
                                class="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                                <button v-for="b in bookResults" :key="b.id" @click="selectBook(b)"
                                    :disabled="b.available_copies < 1"
                                    class="w-full flex items-center justify-between px-3 py-2 hover:bg-indigo-50 text-left border-b border-gray-50 last:border-0 disabled:opacity-50">
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">{{ b.title }}</p>
                                        <p class="text-xs text-gray-400">{{ b.author }}</p>
                                    </div>
                                    <span
                                        :class="['text-xs font-bold ml-2', b.available_copies > 0 ? 'text-green-600' : 'text-red-500']">{{
                                            b.available_copies }} avail</span>
                                </button>
                            </div>
                            <div v-if="issueForm.library_book_id"
                                class="mt-2 flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                                <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-green-600" />
                                <span class="text-sm text-green-700">{{ issueForm.selectedBookTitle }}</span>
                                <button @click="issueForm.library_book_id = ''; issueForm.selectedBookTitle = ''"
                                    class="ml-auto text-gray-400">
                                    <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Due Date (default: 14
                                days)</label>
                            <input v-model="issueForm.due_date" type="text" placeholder="YYYY-MM-DD"
                                autocomplete="new-password"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showIssueModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleIssue" :disabled="issuing"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">{{
                                issuing ? 'Issuing...' : 'Issue Book' }}</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- RETURN MODAL -->
        <Teleport to="body">
            <div v-if="showReturnModal && returningIssue"
                class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Return Book</h3>
                        <button @click="showReturnModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                            <div class="flex justify-between text-sm"><span class="text-gray-500">Book</span><span
                                    class="font-medium text-gray-900 truncate ml-4">{{ returningIssue.book?.title
                                    }}</span></div>
                            <div class="flex justify-between text-sm"><span class="text-gray-500">Member</span><span
                                    class="font-medium">{{ returningIssue.member?.name }}</span></div>
                            <div class="flex justify-between text-sm"><span class="text-gray-500">Due Date</span><span
                                    :class="['font-medium', returningIssue.days_overdue > 0 ? 'text-red-600' : 'text-gray-900']">{{
                                        returningIssue.due_date }}</span></div>
                            <div v-if="returningIssue.days_overdue > 0"
                                class="flex justify-between text-sm pt-2 border-t border-gray-200">
                                <span class="text-red-600 font-medium">Fine ({{ returningIssue.days_overdue }} days ×
                                    ৳5)</span>
                                <span class="text-red-600 font-bold">৳{{ returningIssue.estimated_fine }}</span>
                            </div>
                        </div>
                        <label v-if="returningIssue.estimated_fine > 0"
                            class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" v-model="returnForm.fine_paid" class="rounded" /> Fine paid at time
                            of return
                        </label>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                            <input v-model="returnForm.remarks" autocomplete="new-password" placeholder="Optional..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showReturnModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleReturn" :disabled="returning"
                            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">{{
                                returning ? 'Processing...' : 'Confirm Return' }}</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ADD/EDIT BOOK MODAL -->
        <Teleport to="body">
            <div v-if="showBookModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">{{ editingBook ? 'Edit Book' : 'Add Book' }}
                        </h3>
                        <button @click="showBookModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6">
                        <input type="text" style="display:none" autocomplete="username" />
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="col-span-2">
                                <label class="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                                <input v-model="bookForm.title" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Author *</label>
                                <input v-model="bookForm.author" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">ISBN</label>
                                <input v-model="bookForm.isbn" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-mono" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Publisher</label>
                                <input v-model="bookForm.publisher" autocomplete="new-password"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                                <select v-model="bookForm.category"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="textbook">Textbook</option>
                                    <option value="reference">Reference</option>
                                    <option value="fiction">Fiction</option>
                                    <option value="journal">Journal</option>
                                    <option value="thesis">Thesis</option>
                                    <option value="magazine">Magazine</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Edition</label>
                                <input v-model="bookForm.edition" autocomplete="new-password" placeholder="e.g. 3rd"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Publish Year</label>
                                <input v-model="bookForm.publish_year" autocomplete="new-password" placeholder="2023"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Department</label>
                                <select v-model="bookForm.department_id"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="">General</option>
                                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Total Copies</label>
                                <input v-model="bookForm.total_copies" type="number" min="1"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Price (৳)</label>
                                <input v-model="bookForm.price" type="number" min="0"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Shelf Location</label>
                                <input v-model="bookForm.shelf_location" autocomplete="new-password"
                                    placeholder="e.g. A-12"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-mono uppercase" />
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showBookModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleSaveBook" :disabled="savingBook"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">{{
                                savingBook ? 'Saving...' : (editingBook ? 'Save Changes' : 'Add Book') }}</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ADD MEMBER MODAL -->
        <Teleport to="body">
            <div v-if="showMemberModal" class="modal-overlay fixed inset-0 z-100 flex items-center justify-center p-4"
                style="background:rgba(0,0,0,0.5)">
                <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Add Library Member</h3>
                        <button @click="showMemberModal = false"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Search User *</label>
                            <input v-model="memberForm.userSearch" @input="searchUsers" type="search"
                                autocomplete="new-password" placeholder="Search by name or email..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            <div v-if="userResults.length"
                                class="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <button v-for="u in userResults" :key="u.id" @click="selectUser(u)"
                                    class="w-full flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 text-left border-b border-gray-50 last:border-0">
                                    <img :src="u.avatar_url" class="w-6 h-6 rounded-full" />
                                    <span class="text-sm text-gray-900">{{ u.name }}</span>
                                    <span class="text-xs text-gray-400 ml-auto">{{ u.email }}</span>
                                </button>
                            </div>
                            <div v-if="memberForm.user_id"
                                class="mt-2 flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-indigo-600" />
                                <span class="text-sm text-indigo-700">{{ memberForm.selectedUserName }}</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Member Type *</label>
                                <select v-model="memberForm.member_type"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">Max Books</label>
                                <input v-model="memberForm.max_books" type="number" min="1" max="10"
                                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                        <button @click="showMemberModal = false"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button @click="handleAddMember" :disabled="savingMember"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">{{
                                savingMember ? 'Adding...' : 'Add Member' }}</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const ui = useUiStore(); const api = useApi(); const toast = useToast()
ui.setPageTitle('Library')
const tabs = [{ key: 'books', label: 'Books Catalog' }, { key: 'issues', label: 'Issues & Returns' }, { key: 'members', label: 'Members' }]
const activeTab = ref('books')
const books = ref([]); const issues = ref([]); const members = ref([]); const departments = ref([]); const stats = ref({})
const loadingBooks = ref(false); const loadingIssues = ref(false); const loadingMembers = ref(false)
const issuing = ref(false); const returning = ref(false); const savingBook = ref(false); const savingMember = ref(false)
const showIssueModal = ref(false); const showReturnModal = ref(false); const showBookModal = ref(false); const showMemberModal = ref(false)
const editingBook = ref(null); const returningIssue = ref(null)
const memberResults = ref([]); const bookResults = ref([]); const userResults = ref([])
const bookPagination = ref({ total: 0, current_page: 1, last_page: 1 })
const issuePagination = ref({ total: 0, current_page: 1, last_page: 1 })
const bookFilters = reactive({ search: '', category: '', department_id: '', available: false, page: 1 })
const issueFilters = reactive({ status: '', overdue: false, page: 1 })
const issueForm = reactive({ memberSearch: '', library_member_id: '', selectedMemberName: '', bookSearch: '', library_book_id: '', selectedBookTitle: '', due_date: '' })
const returnForm = reactive({ fine_paid: false, remarks: '' })
const bookForm = reactive({ title: '', author: '', isbn: '', publisher: '', category: 'textbook', edition: '', publish_year: '', department_id: '', total_copies: 1, price: '', shelf_location: '' })
const memberForm = reactive({ userSearch: '', user_id: '', selectedUserName: '', member_type: 'student', max_books: 3 })
const bookPageNumbers = computed(() => { const p = []; for (let i = Math.max(1, bookPagination.value.current_page - 2); i <= Math.min(bookPagination.value.last_page, bookPagination.value.current_page + 2); i++) p.push(i); return p })
const issuePageNumbers = computed(() => { const p = []; for (let i = Math.max(1, issuePagination.value.current_page - 2); i <= Math.min(issuePagination.value.last_page, issuePagination.value.current_page + 2); i++) p.push(i); return p })
const categoryColor = (c) => ({ textbook: 'text-blue-700 bg-blue-50', reference: 'text-purple-700 bg-purple-50', fiction: 'text-green-700 bg-green-50', journal: 'text-amber-700 bg-amber-50', thesis: 'text-indigo-700 bg-indigo-50', magazine: 'text-pink-700 bg-pink-50', other: 'text-gray-700 bg-gray-100' }[c] || 'text-gray-700 bg-gray-100')
const issueStatusColor = (s) => ({ issued: 'text-blue-700 bg-blue-50', returned: 'text-green-700 bg-green-50', overdue: 'text-red-700 bg-red-50', lost: 'text-gray-700 bg-gray-100' }[s] || 'text-gray-700 bg-gray-100')
let bookSearchTimer = null
const debouncedFetchBooks = () => { clearTimeout(bookSearchTimer); bookSearchTimer = setTimeout(fetchBooks, 400) }
const fetchBooks = async () => {
    loadingBooks.value = true
    try {
        const res = await api.get('/library/books', { search: bookFilters.search || undefined, category: bookFilters.category || undefined, department_id: bookFilters.department_id || undefined, available: bookFilters.available || undefined, page: bookFilters.page })
        books.value = res.data || []; bookPagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loadingBooks.value = false }
}
const fetchIssues = async () => {
    loadingIssues.value = true
    try {
        const res = await api.get('/library/issues', { status: issueFilters.status || undefined, overdue: issueFilters.overdue || undefined, page: issueFilters.page })
        issues.value = res.data || []; issuePagination.value = res.pagination || { total: 0, current_page: 1, last_page: 1 }
    } finally { loadingIssues.value = false }
}
const fetchMembers = async () => { loadingMembers.value = true; try { const res = await api.get('/library/members'); members.value = res.data || [] } finally { loadingMembers.value = false } }
const fetchStats = async () => { try { const r = await api.get('/library/stats'); stats.value = r.data || {} } catch { } }
const fetchDepartments = async () => { try { const r = await api.get('/departments', { all: true }); departments.value = r.data || [] } catch { } }
const changeBookPage = (p) => { bookFilters.page = p; fetchBooks() }
const changeIssuePage = (p) => { issueFilters.page = p; fetchIssues() }
let memberTimer = null
const searchMembersForIssue = () => {
    clearTimeout(memberTimer); memberTimer = setTimeout(async () => {
        if (!issueForm.memberSearch || issueForm.memberSearch.length < 2) { memberResults.value = []; return }
        try { const res = await api.get('/library/members/search', { q: issueForm.memberSearch }); memberResults.value = res.data || [] } catch { }
    }, 300)
}
const selectMember = (m) => { issueForm.library_member_id = m.id; issueForm.selectedMemberName = `${m.user?.name} (${m.member_id})`; issueForm.memberSearch = ''; memberResults.value = [] }
let bookTimer = null
const searchBooksForIssue = () => {
    clearTimeout(bookTimer); bookTimer = setTimeout(async () => {
        if (!issueForm.bookSearch || issueForm.bookSearch.length < 2) { bookResults.value = []; return }
        try { const res = await api.get('/library/books', { search: issueForm.bookSearch, per_page: 8 }); bookResults.value = res.data || [] } catch { }
    }, 300)
}
const selectBook = (b) => { issueForm.library_book_id = b.id; issueForm.selectedBookTitle = b.title; issueForm.bookSearch = ''; bookResults.value = [] }
const handleIssue = async () => {
    if (!issueForm.library_member_id || !issueForm.library_book_id) { toast.add({ title: 'Select member and book', color: 'red' }); return }
    issuing.value = true
    try {
        const res = await api.post('/library/issues', { library_book_id: issueForm.library_book_id, library_member_id: issueForm.library_member_id, due_date: issueForm.due_date || undefined })
        toast.add({ title: res.message || 'Book issued', color: 'green' })
        showIssueModal.value = false
        Object.assign(issueForm, { memberSearch: '', library_member_id: '', selectedMemberName: '', bookSearch: '', library_book_id: '', selectedBookTitle: '', due_date: '' })
        fetchBooks(); fetchIssues(); fetchStats()
    } catch (err) { toast.add({ title: err?.data?.message || 'Failed', color: 'red' }) }
    finally { issuing.value = false }
}
const openReturn = (issue) => { returningIssue.value = issue; returnForm.fine_paid = false; returnForm.remarks = ''; showReturnModal.value = true }
const handleReturn = async () => {
    returning.value = true
    try {
        const res = await api.patch(`/library/issues/${returningIssue.value.id}/return`, returnForm)
        toast.add({ title: res.message || 'Book returned', color: 'green' })
        showReturnModal.value = false; fetchBooks(); fetchIssues(); fetchStats()
    } finally { returning.value = false }
}
const openAddBook = () => { editingBook.value = null; Object.assign(bookForm, { title: '', author: '', isbn: '', publisher: '', category: 'textbook', edition: '', publish_year: '', department_id: '', total_copies: 1, price: '', shelf_location: '' }); showBookModal.value = true }
const openEditBook = (b) => { editingBook.value = b; Object.assign(bookForm, { title: b.title, author: b.author, isbn: b.isbn || '', publisher: b.publisher || '', category: b.category, edition: b.edition || '', publish_year: b.publish_year || '', department_id: b.department?.id || '', total_copies: b.total_copies, price: b.price || '', shelf_location: b.shelf_location || '' }); showBookModal.value = true }
const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.author) { toast.add({ title: 'Fill required fields', color: 'red' }); return }
    savingBook.value = true
    try {
        editingBook.value ? await api.put(`/library/books/${editingBook.value.id}`, bookForm) : await api.post('/library/books', bookForm)
        toast.add({ title: editingBook.value ? 'Book updated' : 'Book added', color: 'green' })
        showBookModal.value = false; fetchBooks(); fetchStats()
    } catch (err) { toast.add({ title: err?.data?.message || 'Failed', color: 'red' }) }
    finally { savingBook.value = false }
}
const deleteBook = async (b) => {
    if (!confirm(`Delete "${b.title}"?`)) return
    try { await api.delete(`/library/books/${b.id}`); toast.add({ title: 'Deleted', color: 'green' }); fetchBooks(); fetchStats() }
    catch (err) { toast.add({ title: err?.data?.message || 'Cannot delete', color: 'red' }) }
}
let userTimer = null
const searchUsers = () => {
    clearTimeout(userTimer); userTimer = setTimeout(async () => {
        if (!memberForm.userSearch || memberForm.userSearch.length < 2) { userResults.value = []; return }
        try { const res = await api.get('/users', { search: memberForm.userSearch, per_page: 5 }); userResults.value = res.data || [] } catch { }
    }, 300)
}
const selectUser = (u) => { memberForm.user_id = u.id; memberForm.selectedUserName = u.name; memberForm.userSearch = ''; userResults.value = [] }
const handleAddMember = async () => {
    if (!memberForm.user_id) { toast.add({ title: 'Select a user', color: 'red' }); return }
    savingMember.value = true
    try {
        await api.post('/library/members', { user_id: memberForm.user_id, member_type: memberForm.member_type, max_books: memberForm.max_books })
        toast.add({ title: 'Member added', color: 'green' })
        showMemberModal.value = false; fetchMembers(); fetchStats()
    } catch (err) { toast.add({ title: err?.data?.message || 'Failed', color: 'red' }) }
    finally { savingMember.value = false }
}
watch(activeTab, (tab) => { if (tab === 'issues') fetchIssues(); if (tab === 'members') fetchMembers() })
onMounted(async () => { await Promise.all([fetchBooks(), fetchStats(), fetchDepartments()]) })
</script>