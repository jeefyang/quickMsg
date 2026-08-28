<template>
  <!-- 页码 -->
  <n-drawer v-model:show="modelShow" placement="top" :z-index="9">
    <n-drawer-content title="页码">
      <n-button
        class="m-2"
        v-for="item in dataStore.pageList"
        :key="item.uuid"
        :type="item.name == dataStore?.pageData?.config?.name ? 'primary' : 'default'"
        @click="toSelectPage(item)"
        :loading="loading"
        :disabled="item.name == dataStore?.pageData?.config?.name"
        >{{ item.title }}</n-button
      >
    </n-drawer-content>
  </n-drawer>
  <n-modal v-model:show="showModal" :z-index="9">
    <n-card size="huge" aria-modal="true" bordered style="width: 600px; max-width: 100%">
      <n-form>
        <n-form-item label="二次验证码">
          <n-input
            v-model:value="secondCode"
            placeholder="请输入二次验证码,可留空"
            clearable
          ></n-input>
        </n-form-item>
      </n-form>
      <n-flex justify="end">
        <n-button type="primary" @click="toJump(selectItem!)">确定</n-button>
        <n-button @click="showModal = false">取消</n-button>
      </n-flex>
    </n-card>
  </n-modal>
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
const showModal = ref(false)

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const secondCode = ref('')

watch(
  () => showModal.value,
  (val) => {
    if (!val) {
      return
    }
    secondCode.value = ''
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

const selectItem = ref<PageConfigType | null>(null)
const toSelectPage = async (item: PageConfigType) => {
  modelShow.value = false
  showModal.value = true
  selectItem.value = item
}

const toJump = async (item: PageConfigType) => {
  const res = await dataStore.updatePageData(item.name, secondCode.value)
  if (res.code != 200) {
    msg.error(res.msg)
    return
  }
  msg.success(res.msg)
  showModal.value = false
}
</script>
