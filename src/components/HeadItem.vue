<template>
  <n-flex justify="space-between" class="mt-2">
    <div class="ml-5">123</div>
    <div>{{ dataStore?.pageData?.config?.title }}</div>
    <div class="mr-3">123</div>
  </n-flex>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()
</script>
<style scoped></style>
