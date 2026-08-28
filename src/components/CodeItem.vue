<template>
  <n-select
    v-model:value="_lang"
    :options="swichLangOptions"
    @update:value="changeLang"
    :disabled="!props.canSwitchLang"
  />
  <n-scrollbar :style="{ maxHeight: props.maxHeight }">
    <section data-syntax-theme="vscode-plus">
      <micro-lighter :language="_lang" line-numbers>
        <pre
          style="width: fit-content"
        ><code :contentEditable="props.editable?'plaintext-only':undefined" spellcheck="false" @focus="onFocus" @input="onInput" @blur="onBlur" :innerHTML="props.content"></code></pre>
      </micro-lighter>
    </section>
  </n-scrollbar>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 是否能编辑 */
    editable?: boolean
    /** 语言 */
    lang?: LangType
    /** 内容 */
    content: string
    /** 是否可以选择语言 */
    canSwitchLang?: boolean
    maxHeight?: string
  }>(),
  {
    editable: false,
    lang: 'javascript',
    canSwitchLang: false,
    maxHeight: '50vh',
  },
)

const _lang = ref<LangType>(props.lang)

watch(
  () => props.lang,
  (newVal) => {
    _lang.value = newVal
  },
)

const emits = defineEmits(['update:lang', 'update:content', 'switchLang'])

const switchLangList: LangType[] = [
  'javascript',
  'typescript',
  'vue',
  'html',
  'markdown',
  'json',
  'yaml',
  'python',
  'powershell',
  'toml',
  'bash',
  'c',
  'cpp',
  'csharp',
  'css',
  'dart',
  'dockerfile',
  'elixir',
  'git-diff',
  'go',
  'graphql',
  'heex',
  'java',
  'kotlin',
  'lua',
  'objective-c',
  'perl',
  'php',
  'r',
  'ruby',
  'rust',
  'scss',
  'sql',
  'svelte',
  'swift',
  'tsx',
]

const swichLangOptions: {
  label: LangType
  value: LangType
}[] = switchLangList.map((item) => {
  return {
    label: item,
    value: item,
  }
})

const changeLang = (lang: LangType) => {
  emits('update:lang', lang)
  emits('switchLang', lang)
  _lang.value = lang
}

const onFocus = (e: Event) => {
  const target = e.target as HTMLInputElement
  target.style.outline = 'none'
  emits('update:content', target.innerHTML)
}

const onBlur = (e: Event) => {
  const target = e.target as HTMLInputElement
  emits('update:content', target.innerHTML)
}

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  target.dispatchEvent(new Event('syntax-highlight', { bubbles: true }))
}
</script>
