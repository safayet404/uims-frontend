<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900">My {{ terms.groups }}</h2>
      <p class="text-sm text-gray-500 mt-1">Where you teach, and whether today's attendance is done</p>
    </div>
    <TeachingGroups />
  </div>
</template>

<script setup>
import { useUiStore } from '~/stores/ui'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['faculty'] })
const { terms } = useInstitution()
useUiStore().setPageTitle(`My ${terms.value.groups}`)
</script>
