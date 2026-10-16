<template>
  <div class="min-h-screen bg-linear-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">

      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <UIcon name="i-heroicons-academic-cap" class="text-white w-9 h-9" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">UniCore</h1>
        <p class="text-gray-500 mt-1">University Management System</p>
      </div>

      <UCard class="shadow-xl ring-1 ring-gray-200">
        <template #header>
          <div class="text-center">
            <h2 class="text-xl font-semibold text-gray-900">Welcome back</h2>
            <p class="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>
        </template>

        <UForm :schema="schema" :state="form" :validate-on="['input', 'change']" class="space-y-6" @submit="handleLogin">
          <UFormField label="Email" name="email">
            <UInput v-model="form.email" type="email" placeholder="your@unicore.sedu" icon="i-heroicons-envelope"
              size="lg" autofocus class="w-full" />
          </UFormField>


          <UFormField label="Password" name="password">
            <UInput class="w-full mt-5" v-model="form.password" :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password" icon="i-heroicons-lock-closed" size="lg"
              :ui="{ icon: { trailing: { pointer: '' } } }">
              <template #trailing>
                <UButton color="gray" variant="ghost" :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  class="-me-1" @click="showPassword = !showPassword" />
              </template>
            </UInput>
          </UFormField>

          <UButton type="submit" block size="lg" :loading="auth.loading" class="mt-4 py-3 font-semibold">
            Sign In
          </UButton>
        </UForm>

        <template v-if="demoRoles.length" #footer>
          <div class="text-center">
            <p class="text-xs text-gray-400 font-medium">Try the demo — one click, read-only</p>
            <div class="flex flex-wrap justify-center gap-2 mt-3">
              <UButton v-for="role in demoRoles" :key="role" :label="role" color="neutral" variant="outline" size="xs"
                class="capitalize" :disabled="auth.loading" @click="handleDemoLogin(role)" />
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
<script setup>
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'blank',
  middleware: 'guest',
})

useHead({ title: 'Login — UniCore' })

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

const handleLogin = async () => {
  try {
    await auth.login(form.email, form.password)
    toast.add({ title: 'Welcome back!', description: `Logged in as ${auth.user?.name}`, color: 'success' })
    router.push(auth.dashboardRoute)
  } catch (err) {
    const msg = err?.data?.message || 'Login failed. Please check your credentials.'
    toast.add({ title: 'Login Failed', description: msg, color: 'error' })
  }
}

// Roles the backend offers as password-less, read-only demos (empty when the demo is off)
const demoRoles = ref([])
onMounted(async () => {
  try {
    const { $api } = useNuxtApp()
    demoRoles.value = (await $api('/auth/demo-roles')).data || []
  } catch { }
})

const handleDemoLogin = async (role) => {
  try {
    await auth.demoLogin(role)
    toast.add({ title: 'Demo mode', description: `Exploring as ${role}. Changes are disabled.`, color: 'info' })
    router.push(auth.dashboardRoute)
  } catch (err) {
    toast.add({ title: 'Demo unavailable', description: err?.data?.message || 'Please try again later.', color: 'error' })
  }
}
</script>
