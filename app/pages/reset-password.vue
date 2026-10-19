<template>
  <AuthCard title="Choose a new password" :subtitle="done ? '' : `For ${email || 'your account'}`">
    <div v-if="!token || !email" class="mt-6 space-y-4">
      <p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">This reset link is incomplete. Please open the link from your email again, or request a new one.</p>
      <NuxtLink to="/forgot-password" class="block text-center text-sm font-medium text-emerald-700 hover:underline">Request a new link</NuxtLink>
    </div>

    <div v-else-if="done" class="mt-6 space-y-6">
      <p class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ done }}</p>
      <NuxtLink to="/login"
        class="block w-full rounded-xl py-3.5 text-center font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500">
        Sign in
      </NuxtLink>
    </div>

    <form v-else class="mt-8 space-y-4" @submit.prevent="submit">
      <label class="block text-sm">
        <span class="text-gray-700 font-medium">New password</span>
        <input v-model="password" type="password" autocomplete="new-password" required
          class="mt-1 w-full rounded-xl bg-gray-50/70 px-4 py-3 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </label>
      <label class="block text-sm">
        <span class="text-gray-700 font-medium">Confirm new password</span>
        <input v-model="confirmation" type="password" autocomplete="new-password" required
          class="mt-1 w-full rounded-xl bg-gray-50/70 px-4 py-3 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </label>

      <PasswordRules v-model:valid="rulesOk" :password="password" :confirmation="confirmation" />

      <div v-if="error" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ error }}
        <NuxtLink v-if="expired" to="/forgot-password" class="block mt-1 font-medium underline">Request a new link</NuxtLink>
      </div>

      <button type="submit" :disabled="!rulesOk || saving"
        class="w-full rounded-xl py-3.5 font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:pointer-events-none">
        {{ saving ? 'Saving…' : 'Reset password' }}
      </button>
    </form>
  </AuthCard>
</template>

<script setup>
definePageMeta({ layout: 'blank', middleware: 'guest' })
useHead({ title: 'Reset password — UniCore' })

const route = useRoute()
const { $api } = useNuxtApp()

const token = computed(() => route.query.token || '')
const email = computed(() => route.query.email || '')
const password = ref('')
const confirmation = ref('')
const rulesOk = ref(false)
const saving = ref(false)
const done = ref('')
const error = ref('')
const expired = ref(false)

const submit = async () => {
  error.value = ''
  expired.value = false
  saving.value = true
  try {
    const res = await $api('/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, email: email.value, password: password.value, password_confirmation: confirmation.value },
    })
    done.value = res.message
  } catch (err) {
    const errors = err?.data?.errors
    error.value = errors ? Object.values(errors).flat()[0] : (err?.data?.message || 'Could not reset the password.')
    expired.value = !errors && err?.status === 422
  } finally {
    saving.value = false
  }
}
</script>
