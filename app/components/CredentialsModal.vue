<template>
  <Teleport to="body">
    <div v-if="credentials" class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="credentials-title">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 id="credentials-title" class="text-lg font-semibold text-green-700">Account created</h3>
          <p class="text-sm text-gray-500 mt-1">{{ credentials.name }}</p>
        </div>
        <div class="p-6 space-y-3">
          <div v-for="row in rows" :key="row.label" class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <div class="min-w-0">
              <p class="text-xs text-gray-500">{{ row.label }}</p>
              <p class="font-mono text-sm font-semibold text-gray-900 truncate">{{ row.value }}</p>
            </div>
            <button type="button" class="text-xs font-medium text-green-700 hover:underline shrink-0" @click="copy(row.value)">Copy</button>
          </div>
          <p class="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <template v-if="credentials.temporary_password">
              Give these to the account owner now — the temporary password is shown only once.
            </template>
            <template v-else>
              They will sign in with the password you chose.
            </template>
            They will be asked to choose their own password the first time they sign in.
          </p>
        </div>
        <div class="flex justify-end px-6 py-4 border-t border-gray-100">
          <button type="button" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700" @click="emit('close')">Done</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
// Login details of a newly created account; the temporary password is never shown again
const props = defineProps({
  credentials: { type: Object, default: null },
})
const emit = defineEmits(['close'])
const toast = useToast()

const rows = computed(() => {
  const c = props.credentials
  if (!c) return []
  return [
    { label: 'Login', value: c.login },
    ...(c.email && c.email !== c.login ? [{ label: 'Email', value: c.email }] : []),
    ...(c.temporary_password ? [{ label: 'Temporary password', value: c.temporary_password }] : []),
  ]
})

const copy = async (value) => {
  try {
    await navigator.clipboard.writeText(value)
    toast.add({ title: 'Copied', color: 'success' })
  } catch {
    toast.add({ title: 'Could not copy — select the text instead', color: 'warning' })
  }
}
</script>
