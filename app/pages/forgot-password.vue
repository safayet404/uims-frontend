<template>
  <AuthCard icon="i-heroicons-envelope" title="Forgot your password?"
    :subtitle="sent ? '' : 'Enter the email on your account and we will send you a link to choose a new password.'">
    <div v-if="sent" class="mt-4 space-y-4">
      <p class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ sent }}</p>
      <p class="text-sm text-gray-500">The link expires in 60 minutes. Check your spam folder if it does not arrive within a few minutes.</p>
    </div>

    <form v-else class="mt-8 space-y-4" @submit.prevent="submit">
      <label class="block text-sm">
        <span class="text-gray-700 font-medium">Email</span>
        <input v-model="email" type="email" autocomplete="email" required placeholder="you@unicore.edu"
          class="mt-1 w-full rounded-xl bg-gray-50/70 px-4 py-3 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </label>
      <p v-if="error" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</p>
      <button type="submit" :disabled="!email || sending"
        class="w-full rounded-xl py-3.5 font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:pointer-events-none">
        {{ sending ? 'Sending…' : 'Send reset link' }}
      </button>
    </form>

    <NuxtLink to="/login" class="mt-6 block text-center text-sm text-gray-500 hover:text-gray-800">← Back to sign in</NuxtLink>
  </AuthCard>
</template>

<script setup>
definePageMeta({ layout: 'blank', middleware: 'guest' })
useHead({ title: 'Forgot password — UniCore' })

const { $api } = useNuxtApp()
const email = ref('')
const sending = ref(false)
const sent = ref('')
const error = ref('')

const submit = async () => {
  error.value = ''
  sending.value = true
  try {
    sent.value = (await $api('/auth/forgot-password', { method: 'POST', body: { email: email.value } })).message
  } catch (err) {
    error.value = err?.status === 429
      ? 'Too many attempts. Please wait a minute and try again.'
      : (err?.data?.message || 'Could not send the link. Please try again.')
  } finally {
    sending.value = false
  }
}
</script>
