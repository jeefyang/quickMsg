// ecosystem.config.cjs
module.exports = {
    apps: [
        {
            name: "quickMsg",
            script: "./dist/server/index.cjs", // 你的入口文件
            env: {
                SERVER_PORT: 4000,
                NODE_ENV: "production"
            }
        }
    ]
};