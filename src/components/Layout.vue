<template>
  <template v-if="dataStore.isEmpty">
    <n-flex style="width: 100vw; height: 100vh" align="center" justify="center">
      <n-empty description="页面不存在!"> </n-empty>
    </n-flex>
  </template>
  <template v-else-if="!dataStore.isInit">
    <n-flex style="width: 100vw; height: 100vh" align="center" justify="center">
      <n-spin size="large" />
    </n-flex>
  </template>
  <template v-else>
    <HeadItem></HeadItem>
    <ContentItem style="flex: 1; overflow: auto; scrollbar-width: none" class="pb-30"></ContentItem>
    <BottomItem></BottomItem>
  </template>
</template>
<script setup lang="ts">
import HeadItem from './HeadItem.vue'
import ContentItem from './ContentItem.vue'
import BottomItem from './BottomItem.vue'
import { onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()
const msg = useMessage()

onMounted(async () => {
  const pageName = dataStore.getPageName()
  const secondCode = dataStore.getSecondCode()
  const res1 = await dataStore.updatePageList()
  if (res1.code != 200) {
    dataStore.isEmpty = true
    msg.error(res1.msg)
    return
  }

  const res2 = await dataStore.updatePageData(pageName, secondCode)
  if (res2.code != 200) {
    dataStore.isEmpty = true

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
