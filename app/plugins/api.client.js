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
      if (response.status === 403) {
        router.push('/unauthorized')
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
