<template>
  <n-modal v-model:show="showModal">
    <n-card size="huge" aria-modal="true" bordered>
      <n-input v-model:value="content" type="textarea" placeholder="请填写速记信息" />
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
const dataStore = useDataStore()
const msg = useMessage()

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
