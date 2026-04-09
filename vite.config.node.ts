import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import path from "path";
import fs from "fs";

const pm2ExamplePath = 'ecosystem.config.example.cjs';
const pm2Path = 'ecosystem.config.cjs';
if (!fs.existsSync(pm2Path)) {
    fs.writeFileSync(pm2Path, fs.readFileSync(pm2ExamplePath));
}

export default defineConfig({
    build: {
        outDir: 'dist/server',
    },
    plugins: [
        ...VitePluginNode({
            adapter: 'express',
            appPath: './server/index.ts',
            exportName: 'viteNodeApp',
        })
    ],
    server: {
        // 后端进程跑在 3000，对外不可见，只给前端 Proxy 用
        port: Number(process.env.SERVER_PORT || 3000),
        host: '0.0.0.0'
    }
});