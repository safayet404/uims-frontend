export const usePermission = () => {
  const auth = useAuthStore()

  return {
    can:     (permission) => auth.hasPermission(permission),
    hasRole: (role)       => auth.hasRole(role),
    cannot:  (permission) => !auth.hasPermission(permission),
  }
}
