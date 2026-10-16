<template>
  <div class="divide-y divide-gray-100" aria-busy="true" aria-label="Loading">
    <div class="flex items-center gap-4 px-5 py-3 bg-gray-50/60">
      <div v-for="c in cols" :key="c" class="h-3 rounded bg-gray-200 animate-pulse" :style="{ width: `${headerWidths[(c - 1) % headerWidths.length]}%` }" />
    </div>
    <div v-for="r in rows" :key="r" class="flex items-center gap-4 px-5 py-4">
      <div class="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
      <div class="flex-1 space-y-2">
        <div class="h-3 rounded bg-gray-200 animate-pulse" :style="{ width: `${40 + ((r * 17) % 35)}%` }" />
        <div class="h-2.5 rounded bg-gray-100 animate-pulse" :style="{ width: `${25 + ((r * 11) % 25)}%` }" />
      </div>
      <div v-for="c in cols - 2" :key="c" class="hidden md:block h-3 w-20 rounded bg-gray-100 animate-pulse" />
      <div class="h-6 w-16 rounded-full bg-gray-100 animate-pulse" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Number, default: 6 },
  cols: { type: Number, default: 5 },
})

const headerWidths = [18, 12, 14, 10, 8]
</script>
