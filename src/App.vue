<script setup lang="ts">
import { onMounted } from 'vue'
import { useDark } from '@vueuse/core'
import { darkTheme, darkTheme as darkThemePreset, useMessage } from 'naive-ui'
import { useDataStore } from './stores/data'

import HeadItem from './components/HeadItem.vue'
import ContentItem from './components/ContentItem.vue'
import BottomItem from './components/BottomItem.vue'

// 响应式暗色主题（可选）
const isDark = useDark()

const dataStore = useDataStore()

onMounted(async () => {
  const pageName = new URLSearchParams(window.location.search).get('pageName') || 'index'
  const res1 = await dataStore.updatePageList()
  const msg = useMessage()
  if (res1.code != 200) {
    msg.error(res1.msg)
    return
  }

  const res2 = await dataStore.updatePageData(pageName)
  if (res2.code != 200) {
    msg.error(res2.msg)
    return
  }

  const res3 = await dataStore.updateConfig()
  if (res3.code != 200) {
    msg.error(res3.msg)
    return
  }
  dataStore.isInit = true
})
</script>

<template>
  <n-config-provider :theme="darkTheme ? darkThemePreset : undefined">
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <n-flex vertical style="height: 100vh">
          <HeadItem></HeadItem>
          <ContentItem style="flex: 1; overflow: auto; scrollbar-width: none"></ContentItem>
          <BottomItem></BottomItem>
        </n-flex>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style scoped></style>
