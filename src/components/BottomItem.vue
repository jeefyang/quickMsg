<template>
  <n-flex justify="center" class="mb-8" @click="toAdd">
    <n-icon-wrapper :size="40" :border-radius="20">
      <n-icon size="50">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path
            d="M368.5 240H272v-96.5c0-8.8-7.2-16-16-16s-16 7.2-16 16V240h-96.5c-8.8 0-16 7.2-16 16 0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7H240v96.5c0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7 8.8 0 16-7.2 16-16V272h96.5c8.8 0 16-7.2 16-16s-7.2-16-16-16z"
          />
        </svg>
      </n-icon>
    </n-icon-wrapper>
  </n-flex>
  <ModalTextItem v-model:show="showModal"></ModalTextItem>
</template>
<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { reactive, ref } from 'vue'
import ModalTextItem from './ModalTextItem.vue'

const dataStore = useDataStore()
const showModal = ref(false)

const toAdd = () => {
  showModal.value = true
}
</script>
<style scoped></style>
