export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  // A temporary password set by an admin must be replaced before anything else
  if (auth.user?.must_change_password && to.path !== '/change-password') {
    return navigateTo('/change-password')
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
