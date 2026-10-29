// Load the public app config (institution type, demo roles) before the first render
export default defineNuxtPlugin(async () => {
  const { config } = useInstitution()
  const { $api } = useNuxtApp()
  try {
    const res = await $api('/app-config')
    config.value = { ...config.value, ...res.data }
  } catch {
    // Keep the university defaults if the API is unreachable
  }
})
