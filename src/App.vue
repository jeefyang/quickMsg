<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'
import { darkTheme, darkTheme as darkThemePreset } from 'naive-ui'
import { useDataStore } from './stores/data'

import HeadItem from './components/HeadItem.vue'
import ContentItem from './components/ContentItem.vue'
import BottomItem from './components/BottomItem.vue'

// 响应式暗色主题（可选）
const isDark = useDark()

const dataStore = useDataStore()
const route = useRoute()
const queryParams = route.query

console.log(queryParams)
const pageName = queryParams.pageName || 'index'

onMounted(async () => {
  const res1 = await (await fetch('./api/list')).json()
  if (res1.code != 200 || !res1.data) {
    return
  }
  dataStore.pageList = res1.data
  const res2 = await (await fetch('./api/page?name=' + pageName)).json()
  console.log(res2)
  if (res2.code != 200 || !res2.data) {
    return
  }
  dataStore.setPageData(res2.data)
  const res3 = await (await fetch('./api/getConfig')).json()
  if (res3.code == 200) {
    dataStore.config = res3.data
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
