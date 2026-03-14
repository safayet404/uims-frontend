export const useApi = () => {
  const { $api } = useNuxtApp()
  const toast    = useToast()

  const request = async (endpoint, options = {}) => {
    try {
      return await $api(endpoint, options)
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Something went wrong.'
      toast.add({ title: 'Error', description: msg, color: 'red' })
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
