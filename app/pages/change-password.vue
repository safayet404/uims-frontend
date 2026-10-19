<template>
  <AuthCard
    :title="forced ? 'Set your own password' : 'Change password'"
    :subtitle="forced ? 'Your account was set up with a temporary password. Choose a new one to continue.' : 'Choose a new password for your account.'"
  >
    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <label class="block text-sm">
        <span class="text-gray-700 font-medium">{{ forced ? 'Temporary password' : 'Current password' }}</span>
        <input v-model="form.current_password" type="password" autocomplete="current-password" required
          class="mt-1 w-full rounded-xl bg-gray-50/70 px-4 py-3 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </label>
      <label class="block text-sm">
        <span class="text-gray-700 font-medium">New password</span>
        <input v-model="form.password" type="password" autocomplete="new-password" required
          class="mt-1 w-full rounded-xl bg-gray-50/70 px-4 py-3 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </label>
      <label class="block text-sm">
        <span class="text-gray-700 font-medium">Confirm new password</span>
        <input v-model="form.password_confirmation" type="password" autocomplete="new-password" required
          class="mt-1 w-full rounded-xl bg-gray-50/70 px-4 py-3 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </label>

      <PasswordRules v-model:valid="rulesOk" :password="form.password" :confirmation="form.password_confirmation" :current="form.current_password" />

      <p v-if="error" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</p>

      <button type="submit" :disabled="!allOk || saving"
        class="w-full rounded-xl py-3.5 font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:pointer-events-none">
        {{ saving ? 'Saving…' : 'Save new password' }}
      </button>
    </form>

    <button type="button" class="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-800" @click="signOut">
      Sign out instead
    </button>
  </AuthCard>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'blank', middleware: 'auth' })
useHead({ title: 'Change password — UniCore' })

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const { $api } = useNuxtApp()

const forced = computed(() => !!auth.user?.must_change_password)
const form = reactive({ current_password: '', password: '', password_confirmation: '' })
const saving = ref(false)
const error = ref('')

const rulesOk = ref(false)
const allOk = computed(() => form.current_password && rulesOk.value)

const submit = async () => {
  error.value = ''
  saving.value = true
  try {
    const res = await $api('/auth/change-password', { method: 'PUT', body: form })
    auth.updateUser(res.user)
    toast.add({ title: 'Password updated', description: 'Other devices have been signed out.', color: 'success' })
    router.push(auth.dashboardRoute)
  } catch (err) {
    const errors = err?.data?.errors
    error.value = errors ? Object.values(errors).flat()[0] : (err?.data?.message || 'Could not change the password.')
  } finally {
    saving.value = false
  }
}

const signOut = async () => {
  await auth.logout()
  router.push('/login')
}
</script>
