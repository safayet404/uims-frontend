<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-emerald-50/40 relative overflow-hidden">
    <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
    <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-200/40 blur-3xl" />

    <div class="relative w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/5">
      <div class="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
        <UIcon :name="icon" class="w-6 h-6 text-white" />
      </div>
      <h1 class="mt-6 text-2xl font-bold text-gray-900">{{ title }}</h1>
      <p v-if="subtitle" class="mt-2 text-sm text-gray-500">{{ subtitle }}</p>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'i-heroicons-key' },
})
</script>
