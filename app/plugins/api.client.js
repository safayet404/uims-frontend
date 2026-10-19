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
      // 403 is not redirected: page access is checked by the route middleware,
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
