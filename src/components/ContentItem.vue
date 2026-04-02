<template>
  <n-flex vertical>
    <n-flex
      vertical
      class="ml-2 mr-2 mb-4"
      v-for="item in dataStore.pageData.list"
      :key="item.uuid"
    >
      <n-card bordered>
        <div>{{ item.content }}</div>
      </n-card>
      <n-flex justify="space-between" align="center">
        <n-flex>
          <n-button size="small" type="primary" @click="toCopy(item)">复制</n-button>
          <n-button size="small" @click="toEdit(item)">修改</n-button>
          <n-button size="small" type="error" @click="toDel(item)">删除</n-button>
        </n-flex>
        <div>{{ dataStore.getDateFn(item.updateTime) }}</div>
      </n-flex>
    </n-flex>
    <ModalTextItem v-model:show="showModal" :uuid="editUUid"></ModalTextItem>
  </n-flex>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { useDialog, useMessage } from 'naive-ui'
import ModalTextItem from './ModalTextItem.vue'
import { ref } from 'vue'

const dataStore = useDataStore()
const msg = useMessage()
const dialog = useDialog()
const showModal = ref(false)
const editUUid = ref('')

// 将上面的 copyText 函数定义放在这里，或者单独引入
function copyText(text: any) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => resolve(true))
        .catch((err) => reject(err))
    } else {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.width = '2em'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        successful ? resolve(true) : reject()
      } catch (err) {
        reject(err)
      }
    }
  })
}

const toEdit = (item: PageItemType) => {
  editUUid.value = item.uuid
  showModal.value = true
}

const toDel = async (item: PageItemType) => {
  const res = dialog.warning({
    title: '提示',
    content: '确定要删除吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const res = await (
        await fetch('./api/deleteItem', {
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          method: 'POST',
          body: JSON.stringify({
            uuid: item.uuid,
            page: dataStore.pageData.config.name,
          }),
        })
      ).json()
      if (res.code == 200) {
        dataStore.pageData = res.data
        msg.success(res.msg)
      } else {
        msg.error(res.msg)
      }
    },
  })
}

const toCopy = async (item: PageItemType) => {
  const res = await copyText(item.content)
  if (res) {
    msg.success('复制成功')
  } else {
    msg.error('复制失败')
  }
}
</script>
<style scoped></style>
