<template>
  <UApp>
    <NuxtLoadingIndicator color="linear-gradient(to right, #10b981, #14b8a6)" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
useHead({
  htmlAttrs: { 'data-theme': 'light', style: 'color-scheme: light' },
  bodyAttrs: { style: 'background-color: #f9fafb; color: #111827;' },
})
</script>
