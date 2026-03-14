import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: import.meta.client ? JSON.parse(localStorage.getItem('unicore_user') || 'null') : null,
    token: import.meta.client ? localStorage.getItem('unicore_token') || null : null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isOnline: (state) => state.user?.is_online || false,
    roles: (state) => state.user?.roles || [],
    permissions: (state) => state.user?.permissions || [],

    hasRole: (state) => (role) => {
      if (Array.isArray(role)) return role.some(r => state.user?.roles?.includes(r))
      return state.user?.roles?.includes(role) || false
    },

    hasPermission: (state) => (permission) => {
      if (state.user?.roles?.includes('super-admin')) return true
      return state.user?.permissions?.includes(permission) || false
    },

    isSuperAdmin: (state) => state.user?.roles?.includes('super-admin') || false,
    isAdmin: (state) => state.user?.roles?.includes('admin') || false,
    isFaculty: (state) => state.user?.roles?.includes('faculty') || false,
    isStudent: (state) => state.user?.roles?.includes('student') || false,

    dashboardRoute: (state) => {
      const role = state.user?.roles?.[0]
      const routes = {
        'super-admin': '/dashboard',
        'admin': '/dashboard',
        'faculty': '/faculty/dashboard',
        'student': '/student/dashboard',
        'staff': '/staff/dashboard',
        'librarian': '/library/dashboard',
        'accountant': '/finance/dashboard',
        'admission-officer': '/admissions/dashboard',
      }
      return routes[role] || '/dashboard'
    },
  },

  actions: {
    async login(email, password) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const data = await $api('/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        this.token = data.token
        this.user = data.user
        localStorage.setItem('unicore_token', data.token)
        localStorage.setItem('unicore_user', JSON.stringify(data.user))
        return data
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const { $api } = useNuxtApp()
      try {
        await $api('/auth/logout', { method: 'POST' })
      } catch { }
      finally {
        this.clearAuth()
      }
    },

    async fetchMe() {
      const { $api } = useNuxtApp()
      try {
        const data = await $api('/auth/me')
        this.user = data.user
        localStorage.setItem('unicore_user', JSON.stringify(data.user))
      } catch {
        this.clearAuth()
      }
    },

    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('unicore_token')
      localStorage.removeItem('unicore_user')
    },

    updateUser(user) {
      this.user = { ...this.user, ...user }
      localStorage.setItem('unicore_user', JSON.stringify(this.user))
    },
  },
})
