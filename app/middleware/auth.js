export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  // Check required role if defined in page meta
  if (to.meta.roles) {
    const allowed = Array.isArray(to.meta.roles) ? to.meta.roles : [to.meta.roles]
    if (!auth.hasRole(allowed)) {
      return navigateTo('/unauthorized')
    }
  }

  // Check required permission if defined in page meta
  if (to.meta.permission) {
    if (!auth.hasPermission(to.meta.permission)) {
      return navigateTo('/unauthorized')
    }
  }
})
