<template>
  <ul class="space-y-1.5 text-xs" aria-live="polite">
    <li v-for="rule in rules" :key="rule.label" :class="['flex items-center gap-2', rule.ok ? 'text-emerald-700' : 'text-gray-400']">
      <span aria-hidden="true" :class="['w-4 h-4 shrink-0 rounded-full text-[10px] leading-4 text-center font-bold', rule.ok ? 'bg-emerald-600 text-white' : 'ring-1 ring-gray-300']">{{ rule.ok ? '✓' : '' }}</span>
      {{ rule.label }}
    </li>
  </ul>
</template>

<script setup>
// Mirrors the server's password policy; the server still has the final say
const props = defineProps({
  password: { type: String, default: '' },
  confirmation: { type: String, default: '' },
  // When set, the new password must differ from it
  current: { type: String, default: null },
})

const emit = defineEmits(['update:valid'])

const rules = computed(() => [
  { label: 'At least 8 characters', ok: props.password.length >= 8 },
  { label: 'Contains a letter and a number', ok: /[a-z]/i.test(props.password) && /\d/.test(props.password) },
  ...(props.current !== null ? [{ label: 'Different from the current password', ok: !!props.password && props.password !== props.current }] : []),
  { label: 'Both new passwords match', ok: !!props.password && props.password === props.confirmation },
])

watch(rules, value => emit('update:valid', value.every(r => r.ok)), { immediate: true })
</script>
