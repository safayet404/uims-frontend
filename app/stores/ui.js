import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarOpen:      true,
    sidebarCollapsed: false,
    pageTitle:        'Dashboard',
    breadcrumbs:      [],
    notifications:    [],
    unreadCount:      0,
  }),

  actions: {
    toggleSidebar()    { this.sidebarOpen = !this.sidebarOpen },
    toggleCollapse()   { this.sidebarCollapsed = !this.sidebarCollapsed },
    closeSidebar()     { this.sidebarOpen = false },
    openSidebar()      { this.sidebarOpen = true },

    setPageTitle(title) {
      this.pageTitle = title
      if (import.meta.client) {
        document.title = `${title} — UniCore`
      }
    },

    setBreadcrumbs(crumbs) {
      this.breadcrumbs = crumbs
    },

    setUnreadCount(count) {
      this.unreadCount = count
    },
  },
})
