import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';

import AutoImport from 'unplugin-auto-import/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';

import UnoCSS from 'unocss/vite';

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: 'dist/client',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // 如果是 node_modules 里的文件
                    if (id.includes('node_modules')) {
                        // 将 Vue 相关库单独打包
                        if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                            return 'vue-vendor';
                        }
                        // 其他第三方库打包到 common
                        return 'common-vendor';
                    }
                }
            }
        }
    },
    plugins: [
        vue(),
        vueJsx(),
        vueDevTools(),
        UnoCSS(),
        AutoImport({
            imports: [
                'vue',
                {
                    'naive-ui': [
                        'useDialog',
                        'useMessage',
                        'useNotification',
                        'useLoadingBar'
                    ]
                }
            ]
        }),
        Components({
            resolvers: [NaiveUiResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
});
