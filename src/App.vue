<script setup lang="ts">
import { darkTheme, darkTheme as darkThemePreset } from 'naive-ui'
import Layout from './components/Layout.vue'
</script>

<template>
  <n-config-provider :theme="darkTheme ? darkThemePreset : undefined">
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <n-flex vertical style="height: 100vh">
          <layout></layout>
        </n-flex>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style scoped></style>
