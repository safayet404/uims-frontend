<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UNotifications />
</template>

<script setup>
useHead({
  htmlAttrs: { 'data-theme': 'light', style: 'color-scheme: light' },
  bodyAttrs: { style: 'background-color: #f9fafb; color: #111827;' },
})
</script>
