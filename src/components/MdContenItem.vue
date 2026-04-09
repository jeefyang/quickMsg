<template>
  <div style="overflow: auto; scrollbar-width: none" :style="{ maxHeight: props.maxHeight }">
    <MdPreview class="p-2" v-model="props.content" theme="dark" previewTheme="github" />
  </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  maxHeight: {
    type: String,
    default: '60vh',
  },
})
</script>
