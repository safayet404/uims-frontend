export const useApi = () => {
  const { $api } = useNuxtApp()
  const toast    = useToast()

  const request = async (endpoint, options = {}) => {
    try {
      return await $api(endpoint, options)
    } catch (err) {
      const method = (options.method || 'GET').toUpperCase()
      // A forbidden background read (e.g. a stats panel the role cannot see)
      // is handled by the page; only report refused actions
      if (!(err?.response?.status === 403 && method === 'GET')) {
        const msg = err?.data?.message || err?.message || 'Something went wrong.'
        toast.add({ title: err?.response?.status === 403 ? 'Not allowed' : 'Error', description: msg, color: 'error' })
      }
      throw err
    }
  }

  return {
    get:    (url, params = {}) => request(url, { method: 'GET', params }),
    post:   (url, body = {})   => request(url, { method: 'POST', body }),
    put:    (url, body = {})   => request(url, { method: 'PUT', body }),
    patch:  (url, body = {})   => request(url, { method: 'PATCH', body }),
    delete: (url)              => request(url, { method: 'DELETE' }),
    upload: (url, formData)    => request(url, { method: 'POST', body: formData }),
  }
}
