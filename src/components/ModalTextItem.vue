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
      <template v-if="selectType == 'text'">
        <n-input
          class="mb-2"
          v-model:value="content"
          type="textarea"
          placeholder="请填写速记信息"
        />
      </template>
      <!-- 图片 -->
      <template v-if="selectType == 'image'">
        <n-flex vertical>
          <n-upload multiple :max="1" @change="toChangeUpload" ref="uploadRef" v-if="!content">
            <n-upload-dragger>
              <div style="margin-bottom: 12px">
                <n-icon size="48" :depth="3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 640 512"
                  >
                    <path
                      d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6c0-53-43-96-96-96c-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160c0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128c0-61.9-44-113.6-102.4-125.4zM393.4 288H328v112c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V288h-65.4c-14.3 0-21.4-17.2-11.3-27.3l105.4-105.4c6.2-6.2 16.4-6.2 22.6 0l105.4 105.4c10.1 10.1 2.9 27.3-11.3 27.3z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </n-icon>
              </div>
              <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传 </n-text>
            </n-upload-dragger>
          </n-upload>
          <n-flex vertical align="center" v-else>
            <n-image :src="content" width="100%"></n-image>
            <n-button type="error" @click="clearUpload">清除</n-button>
          </n-flex>
        </n-flex>
      </template>

      <n-divider />
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
import { useMessage, type UploadFileInfo, type UploadInst } from 'naive-ui'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  uuid?: string
}>()
const emits = defineEmits(['update:show'])
const content = ref('')
let filename = ''
const isPW = ref(false)
const dataStore = useDataStore()
const msg = useMessage()
const selectType = ref(<PageItemTypeType>'text')

const uploadRef = ref<UploadInst | null>(null)

const selectList: { label: string; val: PageItemTypeType }[] = [
  { label: '文本', val: 'text' },
  { label: '图片', val: 'image' },
  { label: 'markdown', val: 'markdown' },
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    // 读取成功
    reader.onload = (e) => {
      //@ts-expect-error
      resolve(e.target.result)
    }

    // 读取失败
    reader.onerror = (e) => {
      reject(e)
    }

    // 开始读取，readAsDataURL 会将文件读取为 Data URL 格式
    reader.readAsDataURL(file)
  })
}

const toChangeUpload = async (options: {
  file: UploadFileInfo
  fileList: Array<UploadFileInfo>
  event?: Event
}) => {
  const target = options.file
  if (!target.type?.includes('image')) {
    msg.error('请选择图片')
    return
  }
  filename = target.name
  const file = options.file.file!
  content.value = await fileToBase64(file)
}

const clearUpload = () => {
  if (uploadRef.value) {
    uploadRef.value.clear()
  }
  content.value = ''
  filename = ''
}

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
          type: selectType.value,
          content: content.value,
          page: dataStore.pageData.config.name,
          isPW: isPW.value,
          filename: filename,
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
