import { Router } from 'express';
import fs from "fs";
import { frameguard } from 'helmet';
import { nanoid } from 'nanoid';
import path from 'path';
import axios from "axios";
import sharp from 'sharp';

const myRouter: Router = Router();
const listDir = "./data/list";
const configPath = "./data/config.json";
const filesDir = "./data/files";


if (!fs.existsSync(listDir)) {
    fs.mkdirSync(listDir, { recursive: true });
}
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
}

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
                uuid: nanoid(32),
            },
            list: []
        };
        list.push('index.json');
        fs.writeFileSync(path.join(listDir, list[0]), JSON.stringify(json));
    }
    const data = list.map(c => {
        const json: PageType = JSON.parse(fs.readFileSync(path.join(listDir, c), 'utf-8'));
        return json.config;
    });
    res.json({
        code: 200,
        msg: "操作成功",
        data
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
    let { type, content, page, isPW, filename }: { type: PageItemTypeType, content: string; page: string, isPW: boolean; filename?: string; } = req.body;
    if (!page || !fs.existsSync(path.join(listDir, `${page}.json`))) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    if (!content) {
        return res.json({
            code: 500,
            msg: "内容缺失",
            data: null
        });
    }
    if (type == 'image') {
        if (!filename) {
            return res.json({
                code: 500,
                msg: "文件名缺失",
                data: null
            });
        }
        const ext = path.extname(filename);
        const newFilename = `${nanoid(32)}${ext}`;
        // 1. 去除前缀 (使用正则匹配 data:image/xxx;base64,)
        const base64String = content.replace(/^data:image\/\w+;base64,/, '');

        // 2. 将 Base64 字符串转换为 Buffer
        const imageBuffer = Buffer.from(base64String, 'base64');
        fs.writeFileSync(path.join(filesDir, newFilename), imageBuffer);
        content = newFilename;
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
    const item = pageJson.list[index];
    if (item.type == 'image' && item.content != content) {
        return res.json({
            code: 500,
            msg: "图片不允许修改",
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
    // 图片需要删除
    if (pageJson.list[index].type == 'image') {
        const filepath = path.join(filesDir, pageJson.list[index].content);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
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

myRouter.post("/addPage", (req, res) => {
    const { name, title }: PageConfigType = req.body;
    if (!name) {
        return res.json({
            code: 500,
            msg: "请填写页面名称",
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
    if (fs.existsSync(path.join(listDir, `${name}.json`))) {
        return res.json({
            code: 500,
            msg: "页面已存在",
            data: null
        });
    }
    const pageJson: PageType = {
        config: {
            title: title,
            name: name,
            uuid: nanoid(32),
        },
        list: []
    };
    fs.writeFileSync(path.join(listDir, `${name}.json`), JSON.stringify(pageJson));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageJson
    });
});

myRouter.post("/deletePage", (req, res) => {
    const { uuid, name }: { uuid: string, name: string; } = req.body;
    if (!uuid) {
        return res.json({
            code: 500,
            msg: "匹配不上",
            data: null
        });
    }
    if (!name) {
        return res.json({
            code: 500,
            msg: "匹配不上",
            data: null
        });
    }
    if (name == 'index') {
        return res.json({
            code: 500,
            msg: "不能删除首页",
            data: null
        });
    }
    if (!fs.existsSync(path.join(listDir, `${name}.json`))) {
        return res.json({
            code: 500,
            msg: "匹配不上",
            data: null
        });
    }
    const pageJson: PageType = JSON.parse(fs.readFileSync(path.join(listDir, `${name}.json`), 'utf-8'));
    if (pageJson.config.uuid != uuid) {
        return res.json({
            code: 500,
            msg: "匹配不上",
            data: null
        });
    }
    for (let i = 0; i < pageJson.list.length; i++) {
        const item = pageJson.list[i];
        if (item.type != 'image') {
            continue;
        }
        const p = path.join(filesDir, item.content);
        if (fs.existsSync(p)) {
            fs.unlinkSync(p);
        }
    }
    fs.unlinkSync(path.join(listDir, `${name}.json`));
    return res.json({
        code: 200,
        msg: "操作成功",
        data: JSON.parse(fs.readFileSync(path.join(listDir, `index.json`), 'utf-8'))
    });
});

myRouter.post("/toSendWX", async (req, res) => {
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
    const item = pageJson.list[index];
    let content = item.content;
    let newfilename = `${nanoid(32)}.png`;
    if (item.type == "image") {
        let extname = path.extname(item.content).toLocaleLowerCase();
        if (![".png", '.jpg', '.jpeg'].includes(extname)) {
            await sharp(path.join(filesDir, item.content)).toFile(path.join(filesDir, newfilename));
            content = newfilename;
            extname = '.png';
        }
        content = fs.readFileSync(path.join(filesDir, content), 'base64');

        content = `data:image/${extname.slice(1)};base64,${content}`;
    }

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
    const data = await axios.post(config.wxSendUrl, { type: item.type, content });
    if (fs.existsSync(path.join(filesDir, newfilename))) {
        fs.unlinkSync(path.join(filesDir, newfilename));
    }
    res.json({
        code: 200,
        msg: "操作成功",
        data: data.data
    });
});

myRouter.get("/files/:filename", async (req, res) => {
    const { filename } = req.params;
    return res.sendFile(path.resolve(path.join(filesDir, filename)));

});

export default myRouter;