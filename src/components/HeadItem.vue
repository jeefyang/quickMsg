<template>
  <n-flex justify="space-between" class="mt-4" align="center">
    <n-flex style="flex: 1; flex-wrap: nowrap">
      <n-button class="ml-3" type="primary" size="small" @click="showSelectPage = true"
        >页码</n-button
      >
      <n-button type="info" size="small" @click="showFilter = true">过滤</n-button>
    </n-flex>

    <div style="flex: 1; text-align: center">{{ dataStore?.pageData?.config?.title }}</div>
    <n-flex style="flex: 1; flex-wrap: nowrap" justify="end">
      <!-- 强制刷新按钮 -->
      <n-icon class="mr-2" size="20" @click="toForceUpdate">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 24 24"
        >
          <path
            d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            fill="currentColor"
          ></path>
        </svg>
      </n-icon>
      <!-- 添加按钮 -->
      <n-icon class="mr-2" size="20" @click="showAddPage = true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 19H5V5h9V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2v9z"
            fill="currentColor"
          ></path>
          <path
            d="M15 13h2v4h-2zm-8-3h2v7H7zm4-3h2v10h-2zm8-2V3h-2v2h-2v2h2v2h2V7h2V5z"
            fill="currentColor"
          ></path>
        </svg>
      </n-icon>
      <!-- 设置按钮 -->
      <n-icon class="mr-5" size="20" @click="showConfig = true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 32 32"
        >
          <path
            d="M32 26v-2h-2.101a4.968 4.968 0 0 0-.732-1.753l1.49-1.49l-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 26 20.101V18h-2v2.101a4.968 4.968 0 0 0-1.753.732l-1.49-1.49l-1.414 1.414l1.49 1.49A4.968 4.968 0 0 0 20.101 24H18v2h2.101a4.968 4.968 0 0 0 .732 1.753l-1.49 1.49l1.414 1.414l1.49-1.49a4.968 4.968 0 0 0 1.753.732V32h2v-2.101a4.968 4.968 0 0 0 1.753-.732l1.49 1.49l1.414-1.414l-1.49-1.49A4.968 4.968 0 0 0 29.899 26zm-7 2a3 3 0 1 1 3-3a3.003 3.003 0 0 1-3 3z"
            fill="currentColor"
          ></path>
          <circle cx="7" cy="20" r="2" fill="currentColor"></circle>
          <path
            d="M14 20a4 4 0 1 1 4-4a4.012 4.012 0 0 1-4 4zm0-6a2 2 0 1 0 2 2a2.006 2.006 0 0 0-2-2z"
            fill="currentColor"
          ></path>
          <circle cx="21" cy="12" r="2" fill="currentColor"></circle>
          <path
            d="M13.02 28.271L3 22.427V9.574l11-6.416l11.496 6.706l1.008-1.728l-12-7a1 1 0 0 0-1.008 0l-12 7A1 1 0 0 0 1 9v14a1 1 0 0 0 .496.864L12.013 30z"
            fill="currentColor"
          ></path>
        </svg>
      </n-icon>
    </n-flex>

    <!-- 页码 -->
    <modal-select-page-item v-model:show="showSelectPage"></modal-select-page-item>
    <!-- 过滤 -->
    <modal-filter-item v-model:show="showFilter"></modal-filter-item>
    <!-- 添加 -->
    <modal-add-page-item v-model:show="showAddPage"></modal-add-page-item>
    <!-- 设置 -->
    <modal-config-item v-model:show="showConfig"></modal-config-item>
  </n-flex>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { useDialog, useMessage } from 'naive-ui'
import { ref } from 'vue'
import ModalConfigItem from './ModalConfigItem.vue'
import ModalSelectPageItem from './ModalSelectPageItem.vue'
import ModalFilterItem from './ModalFilterItem.vue'
import ModalAddPageItem from './ModalAddPageItem.vue'

const dataStore = useDataStore()

const msg = useMessage()

const showSelectPage = ref(false)
const showFilter = ref(false)
const showAddPage = ref(false)
const showConfig = ref(false)

const toForceUpdate = async () => {
  const res = await dataStore.updatePageData()
  if (res.code == 200) {
    res.msg && msg.success(res.msg)
    return
  }
  res.msg && msg.error(res.msg)
}
</script>
<style scoped></style>
