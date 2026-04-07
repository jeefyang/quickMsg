import { Router } from 'express';
import fs from "fs";
import { frameguard } from 'helmet';
import { nanoid } from 'nanoid';
import path from 'path';
import axios from "axios";

const myRouter: Router = Router();
const listDir = "./data/list";
const configPath = "./data/config.json";

const getConfig = () => {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, "{}");
    }
    const config: ConfigType = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
};

myRouter.get('/getConfig', (req, res) => {

    const config = getConfig();
    return res.json({
        code: 200,
        msg: "操作成功",
        data: config
    });
});

myRouter.post('/editConfig', (req, res) => {
    const body: Partial<ConfigType> = req.body;
    let config = getConfig();
    config = { ...config, ...body };
    fs.writeFileSync(configPath, JSON.stringify(config));
    return res.json({
        code: 200,
        msg: "操作成功",
        data: config
    });
});

myRouter.get('/list', (req, res) => {

    if (!fs.existsSync(listDir)) {
        fs.mkdirSync(listDir, { recursive: true });
    }
    const list = fs.readdirSync(listDir);
    if (list.length == 0) {
        const json: PageType = {
            config: {
                name: "index",
                title: "首页",
            },
            list: []
        };
        list.push('index.json');
        fs.writeFileSync(path.join(listDir, list[0]), JSON.stringify(json));
    }
    res.json({
        code: 200,
        msg: "操作成功",
        data: list.map(c => path.basename(c, '.json'))
    });
});

myRouter.get('/page', (req, res) => {
    const { name } = req.query;
    const list = fs.readdirSync(listDir);
    if (!list.includes(`${name}.json`)) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const json: PageType = JSON.parse(fs.readFileSync(path.join(listDir, `${name}.json`), 'utf-8'));
    res.json({
        code: 200,
        msg: "操作成功",
        data: json
    });
});

myRouter.post("/addItem", (req, res) => {
    const { type, content, page, isPW }: { type: PageItemTypeType, content: string; page: string, isPW: boolean; } = req.body;
    if (!page || !fs.existsSync(path.join(listDir, `${page}.json`))) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const pageJson: PageType = JSON.parse(fs.readFileSync(path.join(listDir, `${page}.json`), 'utf-8'));
    const json: PageItemType = {
        type: type,
        content: content,
        createTime: new Date().getTime(),
        updateTime: new Date().getTime(),
        uuid: nanoid(32),
        isPW: isPW,
    };
    pageJson.list.push(json);
    fs.writeFileSync(path.join(listDir, `${page}.json`), JSON.stringify(pageJson));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageJson
    });
});



myRouter.post("/editItem", (req, res) => {
    const { content, page, uuid, isPW }: { content: string; page: string; uuid: string, isPW: boolean; } = req.body;
    if (!page || !fs.existsSync(path.join(listDir, `${page}.json`))) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const pageJson: PageType = JSON.parse(fs.readFileSync(path.join(listDir, `${page}.json`), 'utf-8'));
    const index = pageJson.list.findIndex(c => c.uuid == uuid);
    if (index == -1) {
        return res.json({
            code: 500,
            msg: "项目不存在",
            data: null
        });
    }
    pageJson.list[index] = {
        ...pageJson.list[index],
        content: content,
        isPW: isPW,
        updateTime: new Date().getTime(),
    };
    fs.writeFileSync(path.join(listDir, `${page}.json`), JSON.stringify(pageJson));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageJson
    });
});

myRouter.post("/deleteItem", (req, res) => {
    const { page, uuid }: { page: string; uuid: string; } = req.body;
    if (!page || !fs.existsSync(path.join(listDir, `${page}.json`))) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const pageJson: PageType = JSON.parse(fs.readFileSync(path.join(listDir, `${page}.json`), 'utf-8'));
    const index = pageJson.list.findIndex(c => c.uuid == uuid);
    if (index == -1) {
        return res.json({
            code: 500,
            msg: "项目不存在",
            data: null
        });
    }
    pageJson.list.splice(index, 1);
    fs.writeFileSync(path.join(listDir, `${page}.json`), JSON.stringify(pageJson));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageJson
    });
});

myRouter.post("/editPage", (req, res) => {
    const { name, title }: PageConfigType = req.body;
    if (!name || !fs.existsSync(path.join(listDir, `${name}.json`))) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    if (!title) {
        return res.json({
            code: 500,
            msg: "请填写标题",
            data: null
        });
    }
    const pageJson: PageType = JSON.parse(fs.readFileSync(path.join(listDir, `${name}.json`), 'utf-8'));
    pageJson.config.title = title;
    fs.writeFileSync(path.join(listDir, `${name}.json`), JSON.stringify(pageJson));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageJson
    });
});

myRouter.post("/toSendWX", async (req, res) => {
    const { type, content } = req.body;
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, "{}");
    }
    const config = getConfig();
    if (!config.wxSendUrl) {
        return res.json({
            code: 500,
            msg: "请先配置微信发送地址",
            data: null
        });
    }
    const data = await axios.post(config.wxSendUrl, { type, content });
    res.json({
        code: 200,
        msg: "操作成功",
        data: data.data
    });
});


export default myRouter;