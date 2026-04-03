<template>
  <n-flex justify="space-between" class="mt-4" align="center">
    <n-flex style="flex: 1">
      <n-button class="ml-3" type="primary" size="small" @click="toActivatePage">页码</n-button>
      <n-button type="info" size="small" @click="toActivateFilter">过滤</n-button>
    </n-flex>

    <div style="flex: 1; text-align: center">{{ dataStore?.pageData?.config?.title }}</div>
    <n-flex style="flex: 1" justify="end">
      <div class="mr-3">123</div>
    </n-flex>
    <!-- 页码 -->
    <n-drawer v-model:show="active_page" placement="top">
      <n-drawer-content title="页码">
        <n-button
          v-for="item in dataStore.pageList"
          :type="item == dataStore?.pageData?.config?.name ? 'primary' : 'default'"
          >{{ item }}</n-button
        >
      </n-drawer-content>
    </n-drawer>
    <!-- 过滤 -->
    <n-drawer v-model:show="active_filter" placement="top" :height="400">
      <n-drawer-content title="过滤" >
        <n-checkbox-group
          v-model:value="dataStore.filterData.types"
          @update:value="dataStore.setFilter()"
          class="mb-2"
        >
          <n-space item-style="display: flex;">
            <n-checkbox
              v-for="item in typeList"
              :key="item.value"
              :value="item.value"
              :label="item.name"
            />
          </n-space>
        </n-checkbox-group>
        <n-flex class="mb-2">
          <n-button @click="((dataStore.filterData.types = []), dataStore.setFilter())"
            >全取消</n-button
          >
          <n-button type="primary" @click="unSelectTypes">反选</n-button>
          <n-button type="info" @click="toSort"
            >{{ dataStore.filterData.sort==1?'正序':'反序' }}</n-button
          ><//n-button>
        </n-flex>
        <n-input
          class="mb-2"
          v-model:value="dataStore.filterData.keyword"
          placeholder="关键字"
          @change="dataStore.setFilter()"
          clearable
        />
        <n-date-picker class="mb-2" v-model:value="dataStore.filterData.startUpdateTime" type="datetime" clearable placeholder="修改时间_起始" @update:value="dataStore.setFilter()"/>
        <n-date-picker class="mb-2" v-model:value="dataStore.filterData.endUpdateTime" type="datetime" clearable placeholder="修改时间_终止" @update:value="dataStore.setFilter()"/>
        <n-date-picker class="mb-2" v-model:value="dataStore.filterData.startCreatTime" type="datetime" clearable placeholder="创建时间_起始" @update:value="dataStore.setFilter()"/>
        <n-date-picker class="mb-2" v-model:value="dataStore.filterData.endCreatTime" type="datetime" clearable placeholder="创建时间_终止" @update:value="dataStore.setFilter()"/>
      </n-drawer-content>
    </n-drawer>
  </n-flex>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { ref } from 'vue'

const dataStore = useDataStore()
const active_page = ref(false)
const active_filter = ref(false)

const typeList: { name: string; value: PageItemTypeType }[] = [
  { name: '文本', value: 'text' },
  { name: '图片', value: 'img' },
  { name: 'md', value: 'md' },
]

const toActivatePage = () => {
  active_page.value = true
}

const toActivateFilter = () => {
  active_filter.value = true
}

const unSelectTypes = () => {
  let list: PageItemTypeType[] = ['img', 'md', 'text']
  list = list.filter((item) => !dataStore.filterData.types.includes(item))
  dataStore.filterData.types = list
  dataStore.setFilter()
}

const toSort = () => {
  dataStore.filterData.sort = dataStore.filterData.sort == 1 ? -1 : 1
  dataStore.setFilter()
}
</script>
<style scoped></style>
