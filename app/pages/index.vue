<template>
  <div />
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  router.push(auth.dashboardRoute)
})
</script>