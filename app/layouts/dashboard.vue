<template>
  <div class="min-h-screen bg-gray-50 flex">
    <aside :class="['fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300', ui.sidebarCollapsed ? 'w-16' : 'w-64', ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
      <div class="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <UIcon name="i-heroicons-academic-cap" class="text-white w-5 h-5" />
        </div>
        <span v-if="!ui.sidebarCollapsed" class="font-bold text-gray-900 text-lg">UniCore</span>
        <button class="ml-auto text-gray-400 hover:text-gray-600 hidden lg:block" @click="ui.toggleCollapse()">
          <UIcon :name="ui.sidebarCollapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'" class="w-4 h-4" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <template v-for="group in navGroups" :key="group.label">
          <p v-if="!ui.sidebarCollapsed && group.label" class="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{{ group.label }}</p>
          <template v-for="item in group.items" :key="item.to">
            <NuxtLink
              v-if="canSee(item)"
              :to="item.to"
              :class="['flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive(item.to) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900']"
            >
              <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span v-if="!ui.sidebarCollapsed">{{ item.label }}</span>
            </NuxtLink>
          </template>
        </template>
      </nav>

      <div class="border-t border-gray-100 p-3">
        <div class="flex items-center gap-3">
          <UAvatar :src="auth.user?.avatar_url" :alt="auth.user?.name" size="sm" />
          <div v-if="!ui.sidebarCollapsed" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ auth.user?.name }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ auth.roles[0] }}</p>
          </div>
          <UButton v-if="!ui.sidebarCollapsed" icon="i-heroicons-arrow-right-on-rectangle" size="xs" color="gray" variant="ghost" @click="handleLogout" />
        </div>
      </div>
    </aside>

    <div :class="['flex-1 flex flex-col min-w-0 transition-all duration-300', ui.sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64']">
      <header class="sticky top-0 z-40 bg-white border-b border-gray-200 h-16 flex items-center px-4 gap-4">
        <button class="lg:hidden text-gray-500 hover:text-gray-700" @click="ui.toggleSidebar()">
          <UIcon name="i-heroicons-bars-3" class="w-6 h-6" />
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-semibold text-gray-900 truncate">{{ ui.pageTitle }}</h1>
        </div>
        <div class="flex items-center gap-2">
          <UButton icon="i-heroicons-bell" color="gray" variant="ghost" size="sm" />
          <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/profile')">
            <UAvatar :src="auth.user?.avatar_url" :alt="auth.user?.name" size="sm" />
            <span class="text-sm font-medium text-gray-700 hidden sm:block">{{ auth.user?.name?.split(' ')[0] }}</span>
          </div>
          <UButton icon="i-heroicons-arrow-right-on-rectangle" color="gray" variant="ghost" size="sm" @click="handleLogout" />
        </div>
      </header>

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>

    <div v-if="ui.sidebarOpen" class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="ui.closeSidebar()" />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useUiStore }   from '~/stores/ui'

const auth   = useAuthStore()
const ui     = useUiStore()
const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const isActive = (path) => route.path.startsWith(path)

const canSee = (item) => {
  if (!auth.isAuthenticated) return false
  if (!item.permission && !item.roles) return true
  if (item.roles)      return auth.hasRole(item.roles)
  if (item.permission) return auth.hasPermission(item.permission)
  return true
}

const handleLogout = async () => {
  await auth.logout()
  toast.add({ title: 'Logged out', color: 'green' })
  router.push('/login')
}

const navGroups = computed(() => [
  {
    label: '',
    items: [
      { label: 'Dashboard',     to: '/dashboard',     icon: 'i-heroicons-home',                    permission: 'dashboard.read' },
    ]
  },
  {
    label: 'Academic',
    items: [
      { label: 'Students',      to: '/students',      icon: 'i-heroicons-user-group',              permission: 'students.read' },
      { label: 'Faculty',       to: '/faculty',       icon: 'i-heroicons-briefcase',               permission: 'faculty.read' },
      { label: 'Departments',   to: '/departments',   icon: 'i-heroicons-building-office',         permission: 'departments.read' },
      { label: 'Programs',      to: '/programs',      icon: 'i-heroicons-book-open',               permission: 'programs.read' },
      { label: 'Courses',       to: '/courses',       icon: 'i-heroicons-clipboard-document-list', permission: 'courses.read' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { label: 'Enrollments',   to: '/enrollments',   icon: 'i-heroicons-pencil-square',           permission: 'enrollments.read' },
      { label: 'Timetable',     to: '/timetable',     icon: 'i-heroicons-calendar',                permission: 'timetable.read' },
      { label: 'Attendance',    to: '/attendance',    icon: 'i-heroicons-check-circle',            permission: 'attendance.read' },
      { label: 'Exams',         to: '/exams',         icon: 'i-heroicons-document-text',           permission: 'exams.read' },
      { label: 'Grades',        to: '/grades',        icon: 'i-heroicons-chart-bar',               permission: 'grades.read' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { label: 'Fee Management',to: '/fees',          icon: 'i-heroicons-banknotes',               permission: 'fees.read' },
    ]
  },
  {
    label: 'Services',
    items: [
      { label: 'Admissions',    to: '/admissions',    icon: 'i-heroicons-inbox-arrow-down',        permission: 'admissions.read' },
      { label: 'Library',       to: '/library',       icon: 'i-heroicons-book-open',               permission: 'library.read' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { label: 'Users',         to: '/users',         icon: 'i-heroicons-users',                   permission: 'users.read' },
      { label: 'Roles',         to: '/roles',         icon: 'i-heroicons-shield-check',            permission: 'roles.read' },
      { label: 'Activity Logs', to: '/activity-logs', icon: 'i-heroicons-clipboard-document',      permission: 'activity-logs.read' },
      { label: 'Reports',       to: '/reports',       icon: 'i-heroicons-chart-pie',               permission: 'reports.read' },
      { label: 'Settings',      to: '/settings',      icon: 'i-heroicons-cog-6-tooth',             permission: 'settings.read' },
    ]
  },
])
</script>
