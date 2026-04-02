import { Router } from 'express';
import fs from "fs";
import { nanoid } from 'nanoid';
import path from 'path';

const myRouter: Router = Router();
const listDir = "./data/list";
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
    console.log(req.body);
    const { type, content, page }: { type: PageItemTypeType, content: string; page: string; } = req.body;
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
        uuid: nanoid(32)
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
    const { content, page, uuid }: { content: string; page: string; uuid: string; } = req.body;
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

export default myRouter;