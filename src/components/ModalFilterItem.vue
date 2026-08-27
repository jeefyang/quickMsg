<template>
  <!-- 过滤 -->
  <n-drawer v-model:show="modelShow" placement="top" :height="400" :z-index="9">
    <n-drawer-content title="过滤">
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
        <n-button type="info" @click="toSort">{{
          dataStore.filterData.sort == 1 ? '正序' : '反序'
        }}</n-button>
      </n-flex>
      <n-select
        v-model:value="dataStore.filterData.tags"
        filterable
        multiple
        :options="dataStore.tagList"
        clearable
        class="mb-2"
        placeholder="可选标签"
        @update:value="dataStore.setFilter()"
      />
      <n-input
        class="mb-2"
        v-model:value="dataStore.filterData.keyword"
        placeholder="关键字"
        @change="dataStore.setFilter()"
        clearable
      />
      <n-date-picker
        class="mb-2"
        v-model:value="dataStore.filterData.startUpdateTime"
        type="datetime"
        clearable
        placeholder="修改时间_起始"
        @update:value="dataStore.setFilter()"
      />
      <n-date-picker
        class="mb-2"
        v-model:value="dataStore.filterData.endUpdateTime"
        type="datetime"
        clearable
        placeholder="修改时间_终止"
        @update:value="dataStore.setFilter()"
      />
      <n-date-picker
        class="mb-2"
        v-model:value="dataStore.filterData.startCreatTime"
        type="datetime"
        clearable
        placeholder="创建时间_起始"
        @update:value="dataStore.setFilter()"
      />
      <n-date-picker
        class="mb-2"
        v-model:value="dataStore.filterData.endCreatTime"
        type="datetime"
        clearable
        placeholder="创建时间_终止"
        @update:value="dataStore.setFilter()"
      />
    </n-drawer-content>
  </n-drawer>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { useDialog, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'

const configRef = ref(null)
const msg = useMessage()
const dialog = useDialog()

const loading = ref(false)
const dataStore = useDataStore()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:show'])

const modelShow = computed({
  get() {
    return props.show
  },
  set(val) {
    emits('update:show', val)
  },
})

const typeList: { name: string; value: PageItemTypeType }[] = [
  { name: '文本', value: 'text' },
  { name: '图片', value: 'image' },
  { name: 'markdown', value: 'markdown' },
]

const unSelectTypes = () => {
  let list: PageItemTypeType[] = ['image', 'markdown', 'text']
  list = list.filter((item) => !dataStore.filterData.types.includes(item))
  dataStore.filterData.types = list
  dataStore.setFilter()
}

const toSort = () => {
  dataStore.filterData.sort = dataStore.filterData.sort == 1 ? -1 : 1
  dataStore.setFilter()
}
</script>
