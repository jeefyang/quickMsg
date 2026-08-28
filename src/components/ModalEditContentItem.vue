<template>
  <n-modal v-model:show="showModal" :z-index="9">
    <n-card size="huge" aria-modal="true" bordered v-if="!switchMd">
      <n-flex style="width: 100%" justify="center" class="mb-4" v-if="!props.uuid">
        <n-radio-group v-model:value="selectType" @update:value="toChangeSelect">
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
          v-model:value="formData.content"
          type="textarea"
          placeholder="请填写速记信息"
          style="min-height: 20vh"
        />
      </template>
      <!-- 代码 -->
      <template v-if="selectType == 'code'">
        <code-item
          v-model:content="formData.content!"
          v-model:lang="formData.codeLang"
          editable
          can-switch-lang
        ></code-item>
      </template>
      <!-- 图片 -->
      <template v-if="selectType == 'image'">
        <n-flex vertical v-if="!props.uuid">
          <n-flex vertical v-if="!formData.content">
            <n-upload multiple :max="1" @change="toChangeUpload" ref="uploadRef">
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
            <n-flex justify="center">
              <n-button type="primary" @click="pasteClipboard">粘贴剪切板</n-button>
            </n-flex>
          </n-flex>

          <n-flex vertical align="center" justify="center" v-else>
            <n-image :src="formData.content" width="200"></n-image>
            <n-button type="error" @click="clearUpload">清除</n-button>
          </n-flex>
        </n-flex>
        <n-flex justify="center" v-else>
          <n-image :src="`api/files/${formData.content}`" width="100%"></n-image>
        </n-flex>
      </template>
      <!-- markdown -->
      <template v-if="selectType == 'markdown'">
        <n-flex vertical align="center">
          <n-input
            class="mb-2"
            v-model:value="formData.content"
            type="textarea"
            placeholder="请填写markdown"
            style="min-height: 30vh"
          />
          <n-flex>
            <!-- 隐藏的file input，接受任意文件类型 -->
            <input type="file" ref="mdUploadInput" style="display: none" @change="mdPasterFile" />
            <n-button @click="mdPasterFileClick">文件粘贴</n-button>
            <n-button @click="switchMd = true">预览</n-button>
            <n-button @click="mdPasterClipboard">剪切板粘贴</n-button>
          </n-flex>
        </n-flex>
      </template>
      <n-divider />
      <n-select
        v-model:value="formData.tags"
        filterable
        multiple
        tag
        :options="dataStore.tagList"
        clearable
        class="mb-2"
        placeholder="请选择标签,可自创,可多选"
      />
      <n-switch v-model:value="formData.isSecret" class="mr-2">
        <template #checked> 密文 </template>
        <template #unchecked> 明文 </template>
      </n-switch>
      <n-switch v-model:value="formData.isContentFile" v-if="selectType != 'image' && !props.uuid">
        <template #checked> 存储为文件 </template>
        <template #unchecked> 存储为文本 </template>
      </n-switch>
      <template #footer>
        <n-flex justify="end">
          <n-button class="mr-2" @click="showModal = false">取消</n-button>

          <n-button type="primary" @click="toSubmit" :loading="loading">确认</n-button>
        </n-flex>
      </template>
    </n-card>
    <n-card v-else>
      <n-flex vertical justify="center">
        <md-conten-item :content="formData.content"></md-conten-item>
        <n-button class="mb-3" type="primary" @click="switchMd = false">返回</n-button>
      </n-flex>
    </n-card>
  </n-modal>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { useMessage, type UploadFileInfo, type UploadInst } from 'naive-ui'
import { computed, reactive, ref, watch } from 'vue'
import MdContenItem from './MdContenItem.vue'
import CodeItem from './CodeItem.vue'

const props = defineProps<{
  show: boolean
  uuid?: string
}>()
const emits = defineEmits(['update:show'])

const formData = reactive<Partial<PageItemEditType>>({
  content: '',
  isSecret: false,
  codeLang: 'javascript',
  filename: '',
  isContentFile: false,
  tags: [],
})
const dataStore = useDataStore()
const msg = useMessage()
const selectType = ref(<PageItemTypeType>'text')
const switchMd = ref(false)
const loading = ref(false)

const uploadRef = ref<UploadInst | null>(null)
const mdUploadInput = ref<HTMLInputElement | null>(null)

const selectList: { label: string; val: PageItemTypeType }[] = [
  { label: '文本', val: 'text' },
  { label: '图片', val: 'image' },
  { label: 'markdown', val: 'markdown' },
  { label: '代码', val: 'code' },
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
    switchMd.value = false
    if (props.uuid) {
      const item = dataStore.itemList.find((item) => item.uuid === props.uuid)
      if (item) {
        formData.isSecret = !!item.isSecret
        formData.isContentFile = !!item.isContentFile
        formData.content = item.content
        formData.tags = [...(item.tags || [])]
        selectType.value = item.type
        return
      }
    }
    formData.isSecret = !!dataStore.pageData.config.defaultSecret
    formData.isContentFile = !!dataStore.pageData.config.defaultContentFile
    formData.content = ''
    formData.tags = []
  },
)

const fileTypes: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'image/svg+xml': 'svg',
  'image/ico': 'ico',
  'image/x-icon': 'icon',
}

const pasteClipboard = async () => {
  try {
    const items = await navigator.clipboard.read()

    for (const item of items) {
      // 查找图片类型
      const imageType = item.types.find((type) => type.startsWith('image/'))
      if (imageType) {
        const blob = await item.getType(imageType)
        formData.content = await fileToBase64(blob)
        formData.filename = `image.${fileTypes[imageType] || 'png'}`

        return
      }
    }

    msg.error('剪切板中没有图片')
  } catch (err) {
    msg.error('读取失败')
    console.error(err)
  }
}

const toChangeSelect = () => {
  formData.content = ''
  switchMd.value = false
  if (uploadRef.value) {
    uploadRef.value.clear()
  }
}

function fileToBase64(file: File | Blob): Promise<string> {
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
  formData.filename = target.name
  const file = options.file.file!
  formData.content = await fileToBase64(file)
}

const clearUpload = () => {
  if (uploadRef.value) {
    uploadRef.value.clear()
  }
  formData.content = ''
  formData.filename = ''
}

const mdPasterFileClick = async () => {
  mdUploadInput.value?.click()
}

const toMdImgContent = (url: string, alt: string = 'myUpload') => {
  return `<image src="./api/files/${url}" alt="${alt}" style="width:100%; max-width:400px; display:block;"/>`
}

const mdPasterFile = async (e: Event) => {
  const file: File = (<any>e?.target)?.files?.[0]
  if (!file) {
    msg.error('请选择文件')
    return
  }
  const uploadFormData = new FormData()
  uploadFormData.append('file', file) // 字段名 'file' 与后端对应
  uploadFormData.append('replaceBasename', `${dataStore.getPageName()}`)
  loading.value = true
  const res = await fetch('./api/uploadFile', {
    method: 'POST',
    body: uploadFormData,
  })
  const data: { filename: string } = (await res.json()).data

  formData.content += `\n${toMdImgContent(data.filename)}\n`
  loading.value = false
}

const mdPasterClipboard = async () => {
  try {
    const items = await navigator.clipboard.read()

    for (const item of items) {
      // 查找图片类型
      const imageType = item.types.find((type) => type.startsWith('image/'))
      if (imageType) {
        const blob = await item.getType(imageType)
        const uploadFormData = new FormData()
        uploadFormData.append('file', blob, `image.${fileTypes[imageType] || 'png'}`) // 字段名 'file' 与后端对应
        uploadFormData.append('replaceBasename', `${dataStore.getPageName()}`)
        loading.value = true
        const res = await fetch('./api/uploadFile', {
          method: 'POST',
          body: uploadFormData,
        })
        const data: { filename: string } = (await res.json()).data

        formData.content += `\n${toMdImgContent(data.filename, 'myPasterUpload')}\n`
        loading.value = false
        return
      }
    }

    msg.error('剪切板中没有图片')
  } catch (err) {
    msg.error('读取失败')
    console.error(err)
  }
}

const toSubmit = async () => {
  loading.value = true
  // 修改
  if (props.uuid) {
    const res = await (
      await fetch('./api/editItem', {
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        method: 'POST',
        body: JSON.stringify(<PageItemEditType>{
          uuid: props.uuid,
          content: formData.content,
          page: dataStore.pageData.config.name,
          isSecret: formData.isSecret,
          secondCode: dataStore.getSecondCode(),
          codeLang: formData.codeLang,
          isContentFile: formData.isContentFile,
          tags: formData.tags,
        }),
      })
    ).json()
    if (res.code == 200) {
      dataStore.setPageData(res.data, 'content')
      msg.success(res.msg)
    } else {
      msg.error(res.msg)
      loading.value = false
      return
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
        body: JSON.stringify(<PageItemEditType>{
          type: selectType.value,
          content: formData.content,
          page: dataStore.pageData.config.name,
          isSecret: formData.isSecret,
          secondCode: dataStore.getSecondCode(),
          filename: formData.filename,
          codeLang: formData.codeLang,
          isContentFile: formData.isContentFile,
          tags: formData.tags,
        }),
      })
    ).json()
    if (res.code == 200) {
      dataStore.setPageData(res.data, 'content')
      msg.success(res.msg)
    } else {
      msg.error(res.msg)
      loading.value = false
      return
    }
  }
  showModal.value = false
  loading.value = false
}
</script>
<style scoped></style>
