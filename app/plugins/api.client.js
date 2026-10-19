export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const router = useRouter()

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      const token = localStorage.getItem('unicore_token')
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        localStorage.removeItem('unicore_token')
        localStorage.removeItem('unicore_user')
        router.push('/login')
      }
      if (response.status === 403 && response._data?.code === 'password_change_required') {
        router.push('/change-password')
        return
      }
      // Other 403s are not redirected: page access is checked by the route middleware,
      // and a refused action (e.g. saving in the read-only demo) should show
      // its message on the current page instead of leaving it
    },
  })

  return {
    provide: {
      api,
    },
  }
})
