<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-shield-exclamation" class="w-10 h-10 text-red-500" />
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p class="text-gray-500 mb-6">You don't have permission to view this page.</p>
      <div class="flex gap-3 justify-center">
        <UButton variant="outline" @click="$router.back()">Go Back</UButton>
        <UButton :to="auth.dashboardRoute">Go to Dashboard</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'blank' })
const auth = useAuthStore()
useHead({ title: 'Unauthorized — UniCore' })
</script>
