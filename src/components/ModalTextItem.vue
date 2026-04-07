<template>
  <n-modal v-model:show="showModal">
    <n-card size="huge" aria-modal="true" bordered>
      <n-flex style="width: 100%" justify="center" class="mb-4">
        <n-radio-group v-model:value="selectType">
          <n-radio-button
            v-for="item in selectList"
            :key="item.val"
            :value="item.val"
            :label="item.label"
          />
        </n-radio-group>
      </n-flex>
      <!-- 文本 -->
      <n-input
        class="mb-2"
        v-model:value="content"
        type="textarea"
        placeholder="请填写速记信息"
        v-if="selectType == 'text'"
      />
      <!-- 图片 -->

      <n-switch v-model:value="isPW">
        <template #checked> 密码 </template>
        <template #unchecked> 明文 </template>
      </n-switch>
      <template #footer>
        <n-flex justify="end">
          <n-button class="mr-2" @click="showModal = false">取消</n-button>

          <n-button type="primary" @click="toSubmit">确认</n-button>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { useMessage } from 'naive-ui'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  uuid?: string
}>()
const emits = defineEmits(['update:show'])
const content = ref('')
const isPW = ref(false)
const dataStore = useDataStore()
const msg = useMessage()
const selectType = ref(<PageItemTypeType>'text')

const selectList: { label: string; val: PageItemTypeType }[] = [
  { label: '文本', val: 'text' },
  { label: '图片', val: 'image' },
  { label: 'md', val: 'md' },
]

const showModal = computed({
  get: () => props.show,
  set: (val) => {
    emits('update:show', val)
  },
})

watch(
  () => showModal.value,
  (_val) => {
    if (props.uuid) {
      const item = dataStore.itemList.find((item) => item.uuid === props.uuid)
      if (item) {
        isPW.value = !!item.isPW
        content.value = item.content
        return
      }
    }
    content.value = ''
  },
)

const toSubmit = async () => {
  // 修改
  if (props.uuid) {
    const res = await (
      await fetch('./api/editItem', {
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        method: 'POST',
        body: JSON.stringify({
          uuid: props.uuid,
          content: content.value,
          page: dataStore.pageData.config.name,
          isPW: isPW.value,
        }),
      })
    ).json()
    if (res.code == 200) {
      dataStore.setPageData(res.data)
      msg.success(res.msg)
    } else {
      msg.error(res.msg)
    }
  }
  // 新增
  else {
    const res = await (
      await fetch('./api/addItem', {
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        method: 'POST',
        body: JSON.stringify({
          type: 'text',
          content: content.value,
          page: dataStore.pageData.config.name,
          isPW: isPW.value,
        }),
      })
    ).json()
    if (res.code == 200) {
      dataStore.setPageData(res.data)
      msg.success(res.msg)
    } else {
      msg.error(res.msg)
    }
  }
  showModal.value = false
}
</script>
<style scoped></style>
