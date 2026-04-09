<template>
  <n-flex vertical>
    <n-flex vertical class="ml-3 mr-3 mb-4" v-for="item in dataStore.itemList" :key="item.uuid">
      <n-card bordered @click="item._switchNoPW = !item._switchNoPW">
        <!-- 文本 -->
        <template v-if="item.type == 'text'">
          <div v-if="item.isPW && !item._switchNoPW">
            {{
              item.content
                .split(/./)
                .slice(0, -1)
                .map((c) => '*')
                .join('')
            }}
          </div>
          <div v-else>{{ item.content }}</div>
        </template>
        <!-- 图片 -->
        <template v-if="item.type == 'image'">
          <n-flex width="100%" justify="center">
            <n-icon v-if="item.isPW && !item._switchNoPW" size="80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 5v11.17l2 2V5c0-1.1-.9-2-2-2H5.83l2 2H19zM2.81 2.81L1.39 4.22L3 5.83V19c0 1.1.9 2 2 2h13.17l1.61 1.61l1.41-1.41L2.81 2.81zM5 19V7.83l7.07 7.07l-.82 1.1L9 13l-3 4h8.17l2 2H5z"
                  fill="currentColor"
                ></path>
              </svg>
            </n-icon>
            <n-image
              preview-disabled
              :src="`api/files/${item.content}`"
              width="100%"
              v-else
            ></n-image>
          </n-flex>
        </template>
        <template v-if="item.type == 'markdown'">
          <n-flex width="100%" justify="center" v-if="item.isPW && !item._switchNoPW">
            <n-icon size="80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 32 32"
              >
                <path
                  d="M17.713 13.471l1.863-6.953L17.645 6l-1.565 5.838l1.633 1.633z"
                  fill="currentColor"
                ></path>
                <path
                  d="M24.207 19.965l1.414 1.414L31 16l-7-7l-1.414 1.414L28.172 16l-3.965 3.965z"
                  fill="currentColor"
                ></path>
                <path
                  d="M30 28.586L3.414 2L2 3.414l5.793 5.793L1 16l7 7l1.414-1.414L3.828 16l5.379-5.379l5.677 5.677l-2.461 9.184l1.932.518l2.162-8.069L28.586 30L30 28.586z"
                  fill="currentColor"
                ></path>
              </svg>
            </n-icon>
          </n-flex>

          <MdContenItem :content="item.content" v-else></MdContenItem>
        </template>
      </n-card>
      <!-- 按钮 -->
      <n-flex justify="space-between" align="center">
        <n-flex>
          <n-button size="tiny" type="info" @click="toCopy(item)">复制</n-button>
          <n-button size="tiny" @click="toEdit(item)">修改</n-button>
          <n-button
            size="tiny"
            type="primary"
            v-if="dataStore.config.isWxSend"
            @click="toWx(item)"
            :loading="item.uuid == loading"
            >微信</n-button
          >
          <n-button size="tiny" type="error" :loading="item.uuid == loading" @click="toDel(item)"
            >删除</n-button
          >
        </n-flex>
        <div style="font-size: 12px">{{ dataStore.getDateFn(item.updateTime) }}</div>
      </n-flex>
    </n-flex>
    <ModalContentItem v-model:show="showModal" :uuid="editUUid"></ModalContentItem>
  </n-flex>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { useDialog, useMessage } from 'naive-ui'
import ModalContentItem from './ModalContentItem.vue'
import { ref } from 'vue'
import MdContenItem from './MdContenItem.vue'

const dataStore = useDataStore()
const msg = useMessage()
const dialog = useDialog()
const showModal = ref(false)
const editUUid = ref('')
const loading = ref('')

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
  loading.value = item.uuid
  const log: boolean = await new Promise((resolve) => {
    dialog.warning({
      title: '提示',
      content: '确定要删除吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        resolve(true)
      },
      onNegativeClick: () => {
        resolve(false)
      },
    })
  })
  if (!log) {
    loading.value = ''
    return
  }
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
    dataStore.setPageData(res.data)
    msg.success(res.msg)
  } else {
    msg.error(res.msg)
  }
  loading.value = ''
}

const toWx = async (item: PageItemType) => {
  loading.value = item.uuid
  const res = await (
    await fetch('./api/toSendWX', {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      body: JSON.stringify({
        page: dataStore.pageData.config.name,
        uuid: item.uuid,
      }),
    })
  ).json()
  if (res.code == 200) {
    msg.success(res.data.msg)
  } else {
    msg.error(res.msg)
  }
  loading.value = ''
}

const toCopy = async (item: PageItemType) => {
  let content = item.content
  if (item.type == 'image') {
    content = location.origin + '/api/files/' + item.content
  }
  const res = await copyText(content)
  if (res) {
    msg.success('复制成功')
  } else {
    msg.error('复制失败')
  }
}
</script>
<style scoped></style>
