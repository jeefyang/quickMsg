<template>
  <!-- 设置 -->
  <n-drawer v-model:show="modelShow" placement="top" height="600" :z-index="9">
    <n-drawer-content title="设置">
      <n-form ref="pageConfigRef" :model="pageConfigForm">
        <n-form-item path="title" label="标题">
          <n-input v-model:value="pageConfigForm.title" placeholder="请修改标题"></n-input>
        </n-form-item>
        <n-form-item path="editSecondCode" label="二次验证码(请记住)">
          <n-input
            v-model:value="pageConfigForm.editSecondCode"
            placeholder="请修改二次验证码,可留空"
          ></n-input>
        </n-form-item>
      </n-form>
      <n-flex class="mb-5">
        <n-switch v-model:value="pageConfigForm.defaultSecret" class="mr-2">
          <template #checked> 默认密文 </template>
          <template #unchecked> 默认明文 </template>
        </n-switch>
        <n-switch v-model:value="pageConfigForm.defaultContentFile">
          <template #checked> 默认存储为文件 </template>
          <template #unchecked> 默认存储为文本 </template>
        </n-switch>
      </n-flex>
      <n-flex>
        <n-button type="primary" @click="toEditPageConfig" :loading="loading">修改</n-button>
        <n-button
          type="error"
          @click="toDelPage"
          :loading="loading"
          v-if="dataStore?.pageData?.config?.name != 'index'"
          >删除</n-button
        >
      </n-flex>

      <template v-if="pageConfigForm.name == 'index'">
        <n-divider />
        <n-form ref="configRef" :model="configForm">
          <n-form-item path="isWxSend" label="微信传送">
            <n-switch v-model:value="configForm.isWxSend" />
          </n-form-item>
          <n-form-item ref="wxSendUrl" label="传送路径">
            <n-input v-model:value="configForm.wxSendUrl" placeholder="请输入传送路径"></n-input>
          </n-form-item>
        </n-form>
        <n-button class="mr-3" @click="modelShow = false">取消</n-button>
        <n-button type="primary" @click="toEditConfig" :loading="loading">确认</n-button>
      </template>
      <template v-else>
        <n-button class="mr-3 mt-5" @click="modelShow = false">取消</n-button>
      </template>
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
const pageConfigForm = ref(<PageEditConfigType>{})
const configForm = ref(<ConfigType>{})

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:show'])

watch(
  () => props.show,
  (val) => {
    if (val) {
      pageConfigForm.value = { ...dataStore.pageData.config }
      pageConfigForm.value.secondCode = dataStore.getSecondCode()
      pageConfigForm.value.editSecondCode = pageConfigForm.value.secondCode
      configForm.value = { ...dataStore.config }
      configForm.value.secondCode = dataStore.getSecondCode()
    }
  },
)

const modelShow = computed({
  get() {
    return props.show
  },
  set(val) {
    emits('update:show', val)
  },
})

const toEditPageConfig = async () => {
  if (!pageConfigForm.value.title) {
    return msg.error('请填写标题')
  }
  loading.value = true
  const res = await (
    await fetch('./api/editPage', {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      body: JSON.stringify({
        ...pageConfigForm.value,
      }),
    })
  ).json()
  if (res.code == 200) {
    dataStore.setPageData(res.data, 'config')
    history.replaceState(
      {
        pageName: pageConfigForm.value.name,
        secondCode: pageConfigForm.value.editSecondCode || '',
      },
      '',
      `?pageName=${pageConfigForm.value.name}&secondCode=${pageConfigForm.value.editSecondCode || ''}`,
    )
    msg.success(res.msg)
    modelShow.value = false
  } else {
    msg.error(res.msg)
  }
  loading.value = false
}

const toEditConfig = async () => {
  loading.value = true
  const res = await (
    await fetch('./api/editConfig', {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      body: JSON.stringify({
        ...configForm.value,
        secondCode: dataStore.getSecondCode(),
        page: dataStore.getPageName(),
      }),
    })
  ).json()
  if (res.code == 200) {
    dataStore.config = res.data
    msg.success(res.msg)
    modelShow.value = false
  } else {
    msg.error(res.msg)
  }
  loading.value = false
}

const toDelPage = async () => {
  loading.value = true
  const log: boolean = await new Promise((resolve) => {
    dialog.warning({
      title: '删除',
      content: '确定要删除当前页面吗？',
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
    loading.value = false
    return
  }
  const res = await (
    await fetch('./api/deletePage', {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      body: JSON.stringify({
        name: dataStore.pageData.config.name,
        uuid: dataStore.pageData.config.uuid,
        secondCode: dataStore.getSecondCode(),
      }),
    })
  ).json()
  if (res.code != 200) {
    msg.error(res.msg)
    loading.value = false
    return
  }

  dataStore.setPageData(res.data, 'all')
  const res1 = await dataStore.updatePageList()
  if (res1.code != 200) {
    msg.error(res1.msg)
    loading.value = false
    return
  }
  msg.success(res1.msg)
  modelShow.value = false
  loading.value = false
}
</script>
