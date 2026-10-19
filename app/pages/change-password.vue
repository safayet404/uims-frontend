<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-emerald-50/40 relative overflow-hidden">
    <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
    <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-200/40 blur-3xl" />

    <div class="relative w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/5">
      <div class="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
        <UIcon name="i-heroicons-key" class="w-6 h-6 text-white" />
      </div>

      <h1 class="mt-6 text-2xl font-bold text-gray-900">{{ forced ? 'Set your own password' : 'Change password' }}</h1>
      <p class="mt-2 text-sm text-gray-500">
        <template v-if="forced">Your account was set up with a temporary password. Choose a new one to continue.</template>
        <template v-else>Choose a new password for your account.</template>
      </p>

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

        <ul class="space-y-1.5 text-xs" aria-live="polite">
          <li v-for="rule in rules" :key="rule.label" :class="['flex items-center gap-2', rule.ok ? 'text-emerald-700' : 'text-gray-400']">
            <span aria-hidden="true" :class="['w-4 h-4 shrink-0 rounded-full text-[10px] leading-4 text-center font-bold', rule.ok ? 'bg-emerald-600 text-white' : 'ring-1 ring-gray-300']">{{ rule.ok ? '✓' : '' }}</span>
            {{ rule.label }}
          </li>
        </ul>

        <p v-if="error" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</p>

        <button type="submit" :disabled="!allOk || saving"
          class="w-full rounded-xl py-3.5 font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:pointer-events-none">
          {{ saving ? 'Saving…' : 'Save new password' }}
        </button>
      </form>

      <button type="button" class="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-800" @click="signOut">
        Sign out instead
      </button>
    </div>
  </div>
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

// Mirrors the server rules; the server still has the final say
const rules = computed(() => [
  { label: 'At least 8 characters', ok: form.password.length >= 8 },
  { label: 'Contains a letter and a number', ok: /[a-z]/i.test(form.password) && /\d/.test(form.password) },
  { label: 'Different from the current password', ok: !!form.password && form.password !== form.current_password },
  { label: 'Both new passwords match', ok: !!form.password && form.password === form.password_confirmation },
])
const allOk = computed(() => form.current_password && rules.value.every(r => r.ok))

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
