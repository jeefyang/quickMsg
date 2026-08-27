<template>
  <!-- 添加 -->
  <n-drawer v-model:show="modelShow" placement="top" height="600" :z-index="9">
    <n-drawer-content title="添加页面">
      <n-form ref="pageConfigRef" :model="addPageForm">
        <n-form-item path="title" label="标题">
          <n-input v-model:value="addPageForm.title" placeholder="请输入标题"></n-input>
        </n-form-item>
        <n-form-item path="title" label="标识名">
          <n-input v-model:value="addPageForm.name" placeholder="请输入标识名"></n-input>
        </n-form-item>
        <n-form-item path="secondCode" label="二次验证码(请记住)">
          <n-input
            v-model:value="addPageForm.secondCode"
            placeholder="请输入二次验证码,可留空"
          ></n-input>
        </n-form-item>
      </n-form>
      <n-flex class="mb-5">
        <n-switch v-model:value="addPageForm.defaultSecret" class="mr-2">
          <template #checked> 默认密文 </template>
          <template #unchecked> 默认明文 </template>
        </n-switch>
        <n-switch v-model:value="addPageForm.defaultContentFile">
          <template #checked> 默认存储为文件 </template>
          <template #unchecked> 默认存储为文本 </template>
        </n-switch>
      </n-flex>
      <n-button class="mr-3" @click="modelShow = false">取消</n-button>
      <n-button type="primary" @click="toAddPage" :loading="loading">确认</n-button>
    </n-drawer-content>
  </n-drawer>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { useDialog, useMessage } from 'naive-ui'
import { computed, ref, watch } from 'vue'

const configRef = ref(null)
const msg = useMessage()
const dialog = useDialog()

const loading = ref(false)
const dataStore = useDataStore()

const addPageForm = ref(<Partial<PageConfigType>>{})

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

watch(
  () => props.show,
  (val) => {
    if (val) {
      addPageForm.value = {
        title: '',
        name: '',
      }
    }
  },
)

const emits = defineEmits(['update:show'])

const modelShow = computed({
  get() {
    return props.show
  },
  set(val) {
    emits('update:show', val)
  },
})

const toAddPage = async () => {
  if (!addPageForm.value.title) {
    return msg.error('请填写标题')
  }
  if (!addPageForm.value.name) {
    return msg.error('请填写标识名')
  }
  loading.value = true
  const res = await (
    await fetch('./api/addPage', {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      body: JSON.stringify({
        ...addPageForm.value,
      }),
    })
  ).json()
  if (res.code != 200) {
    msg.error(res.msg)
    loading.value = false
    return
  }
  dataStore.setPageData(res.data, 'all')
  history.replaceState(
    { pageName: addPageForm.value.name, secondCode: addPageForm.value.secondCode || '' },
    '',
    `?pageName=${addPageForm.value.name}&secondCode=${addPageForm.value.secondCode || ''}`,
  )
  const res1 = await dataStore.updatePageList()
  if (res1.code != 200) {
    msg.error(res1.msg)
    loading.value = false
    return
  }
  const res2 = await dataStore.updateConfig()
  if (res2.code != 200) {
    msg.error(res2.msg)
    loading.value = false
    return
  }
  msg.success(res2.msg)
  modelShow.value = false
  loading.value = false
}
</script>
