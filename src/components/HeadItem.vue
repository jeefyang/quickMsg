<template>
  <n-flex justify="space-between" class="mt-4" align="center">
    <n-flex style="flex: 1; flex-wrap: nowrap">
      <n-button class="ml-3" type="primary" size="small" @click="toActivatePage">页码</n-button>
      <n-button type="info" size="small" @click="toActivateFilter">过滤</n-button>
    </n-flex>

    <div style="flex: 1; text-align: center">{{ dataStore?.pageData?.config?.title }}</div>
    <n-flex style="flex: 1" justify="end">
      <!-- 添加按钮 -->
      <n-icon class="mr-2" size="20" @click="toActiveAddPage">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 19H5V5h9V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2v9z"
            fill="currentColor"
          ></path>
          <path
            d="M15 13h2v4h-2zm-8-3h2v7H7zm4-3h2v10h-2zm8-2V3h-2v2h-2v2h2v2h2V7h2V5z"
            fill="currentColor"
          ></path>
        </svg>
      </n-icon>
      <!-- 设置按钮 -->
      <n-icon class="mr-5" size="20" @click="toActiveConfig">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 32 32"
        >
          <path
            d="M32 26v-2h-2.101a4.968 4.968 0 0 0-.732-1.753l1.49-1.49l-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 26 20.101V18h-2v2.101a4.968 4.968 0 0 0-1.753.732l-1.49-1.49l-1.414 1.414l1.49 1.49A4.968 4.968 0 0 0 20.101 24H18v2h2.101a4.968 4.968 0 0 0 .732 1.753l-1.49 1.49l1.414 1.414l1.49-1.49a4.968 4.968 0 0 0 1.753.732V32h2v-2.101a4.968 4.968 0 0 0 1.753-.732l1.49 1.49l1.414-1.414l-1.49-1.49A4.968 4.968 0 0 0 29.899 26zm-7 2a3 3 0 1 1 3-3a3.003 3.003 0 0 1-3 3z"
            fill="currentColor"
          ></path>
          <circle cx="7" cy="20" r="2" fill="currentColor"></circle>
          <path
            d="M14 20a4 4 0 1 1 4-4a4.012 4.012 0 0 1-4 4zm0-6a2 2 0 1 0 2 2a2.006 2.006 0 0 0-2-2z"
            fill="currentColor"
          ></path>
          <circle cx="21" cy="12" r="2" fill="currentColor"></circle>
          <path
            d="M13.02 28.271L3 22.427V9.574l11-6.416l11.496 6.706l1.008-1.728l-12-7a1 1 0 0 0-1.008 0l-12 7A1 1 0 0 0 1 9v14a1 1 0 0 0 .496.864L12.013 30z"
            fill="currentColor"
          ></path>
        </svg>
      </n-icon>
    </n-flex>
    <!-- 设置 -->
    <n-drawer v-model:show="active_config" placement="top" height="600">
      <n-drawer-content title="设置">
        <n-form ref="pageConfigRef" :model="pageConfigForm">
          <n-form-item path="title" label="标题">
            <n-input v-model:value="pageConfigForm.title" placeholder="请修改标题"></n-input>
          </n-form-item>
        </n-form>
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
        <n-divider />
        <n-form ref="configRef" :model="configForm">
          <n-form-item path="isWxSend" label="微信传送">
            <n-switch v-model:value="configForm.isWxSend" />
          </n-form-item>
          <n-form-item ref="wxSendUrl" label="传送路径">
            <n-input v-model:value="configForm.wxSendUrl" placeholder="请输入传送路径"></n-input>
          </n-form-item>
        </n-form>
        <n-button class="mr-3" @click="active_config = false">取消</n-button>
        <n-button type="primary" @click="toEditConfig" :loading="loading">确认</n-button>
      </n-drawer-content>
    </n-drawer>

    <!-- 添加 -->
    <n-drawer v-model:show="active_add_page" placement="top" height="600">
      <n-drawer-content title="添加页面">
        <n-form ref="pageConfigRef" :model="pageConfigForm">
          <n-form-item path="title" label="标题">
            <n-input v-model:value="addPageForm.title" placeholder="请输入标题"></n-input>
          </n-form-item>
          <n-form-item path="title" label="标识名">
            <n-input v-model:value="addPageForm.name" placeholder="请输入标识名"></n-input>
          </n-form-item>
        </n-form>
        <n-button class="mr-3" @click="active_add_page = false">取消</n-button>
        <n-button type="primary" @click="toAddPage" :loading="loading">确认</n-button>
      </n-drawer-content>
    </n-drawer>
    <!-- 页码 -->
    <n-drawer v-model:show="active_page" placement="top">
      <n-drawer-content title="页码">
        <n-button
          class="m-2"
          v-for="item in dataStore.pageList"
          :key="item.uuid"
          :type="item.name == dataStore?.pageData?.config?.name ? 'primary' : 'default'"
          @click="toSelectPage(item)"
          :loading="loading"
          >{{ item.title }}</n-button
        >
      </n-drawer-content>
    </n-drawer>
    <!-- 过滤 -->
    <n-drawer v-model:show="active_filter" placement="top" :height="400">
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
  </n-flex>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { useDialog, useMessage } from 'naive-ui'
import { ref } from 'vue'

const dataStore = useDataStore()
const active_page = ref(false)
const active_filter = ref(false)
const active_config = ref(false)
const active_add_page = ref(false)
const loading = ref(false)

const msg = useMessage()
const dialog = useDialog()

const pageConfigRef = ref(null)
const pageConfigForm = ref(<PageConfigType>{})

const addPageForm = ref(<Partial<PageConfigType>>{})

const configRef = ref(null)
const configForm = ref(<ConfigType>{})

const typeList: { name: string; value: PageItemTypeType }[] = [
  { name: '文本', value: 'text' },
  { name: '图片', value: 'image' },
  { name: 'markdown', value: 'markdown' },
]

const toActivatePage = () => {
  active_page.value = true
}

const toActivateFilter = () => {
  active_filter.value = true
}

const toActiveConfig = () => {
  pageConfigForm.value = { ...dataStore.pageData.config }
  configForm.value = { ...dataStore.config }
  active_config.value = true
}

const toActiveAddPage = () => {
  addPageForm.value = {
    title: '',
    name: '',
  }
  active_add_page.value = true
}

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
  dataStore.setPageData(res.data)
  const res1 = await dataStore.updatePageList()
  if (res1.code != 200) {
    msg.error(res1.msg)
    loading.value = false
    return
  }
  msg.success(res1.msg)
  active_add_page.value = false
  loading.value = false
}

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
    dataStore.setPageData(res.data)
    msg.success(res.msg)
    active_config.value = false
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
      }),
    })
  ).json()
  if (res.code == 200) {
    dataStore.config = res.data
    msg.success(res.msg)
    active_config.value = false
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
      }),
    })
  ).json()
  if (res.code != 200) {
    msg.error(res.msg)
    loading.value = false
    return
  }

  dataStore.setPageData(res.data)
  const res1 = await dataStore.updatePageList()
  if (res1.code != 200) {
    msg.error(res1.msg)
    loading.value = false
    return
  }
  msg.success(res1.msg)
  active_config.value = false
  loading.value = false
}

const unSelectTypes = () => {
  let list: PageItemTypeType[] = ['image', 'markdown', 'text']
  list = list.filter((item) => !dataStore.filterData.types.includes(item))
  dataStore.filterData.types = list
  dataStore.setFilter()
}

const toSelectPage = async (item: PageConfigType) => {
  if (item.name == dataStore.pageData.config.name) {
    msg.warning('不能选择当前页面')
    return
  }
  const res = await dataStore.updatePageData(item.name)
  console.log(res)
  if (res.code != 200) {
    msg.error(res.msg)
    return
  }
  msg.success(res.msg)
  active_page.value = false
}

const toSort = () => {
  dataStore.filterData.sort = dataStore.filterData.sort == 1 ? -1 : 1
  dataStore.setFilter()
}
</script>
<style scoped></style>
