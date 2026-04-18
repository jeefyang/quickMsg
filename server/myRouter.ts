import { Router } from 'express';
import fs from "fs";
import { nanoid } from 'nanoid';
import path from 'path';
import axios from "axios";
import sharp from 'sharp';

const myRouter: Router = Router();
const configPath = "./data/config.json";
const filesDir = "./data/files";
const pageConfigDir = "./data/page/config"
const pageContentDir = "./data/page/content"



if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
}

if (!fs.existsSync(pageConfigDir)) {
    fs.mkdirSync(pageConfigDir, { recursive: true })
}

if (!fs.existsSync(pageContentDir)) {
    fs.mkdirSync(pageContentDir, { recursive: true })
}

const getConfig = () => {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, "{}");
    }
    const config: ConfigType = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
};

const getPageContent = (name: string): PageContentType | undefined => {
    if (!name) {
        return undefined
    }
    const p = path.join(pageContentDir, `${name}.json`)
    if (!fs.existsSync(p)) {
        return undefined
    }
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

const getPageConfig = (name: string, ext = ".json"): PageConfigType | undefined => {
    if (!name) {
        return undefined
    }
    const p = path.join(pageConfigDir, `${name}${ext}`)
    if (!fs.existsSync(p)) {
        return undefined
    }
    return JSON.parse(fs.readFileSync(p, 'utf-8'));

}

const getPage = (name: string) => {
    const config = getPageConfig(<string>name)!
    const content = getPageContent(<string>name)!
    const json: PageType = {
        config,
        list: content.list
    }
    return json
}

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


    const list = fs.readdirSync(pageConfigDir);
    if (list.length == 0) {
        const uuid = nanoid(32);
        const configJson: PageConfigType = {

            name: "index",
            title: "首页",
            uuid: uuid
        };
        list.push('index.json');
        fs.writeFileSync(path.join(pageConfigDir, list[0]), JSON.stringify(configJson));
        const contentJson: PageContentType = {
            uuid: uuid,
            list: []
        };
        fs.writeFileSync(path.join(pageConfigDir, list[0]), JSON.stringify(contentJson));
    }
    const data = list.map(c => {
        const json = getPageConfig(c, "");
        return json;
    });
    res.json({
        code: 200,
        msg: "操作成功",
        data
    });
});

myRouter.get('/page', (req, res) => {
    const { name } = req.query;
    const configP = path.join(pageConfigDir, `${name}.json`)
    const contentP = path.join(pageContentDir, `${name}.json`)
    if (!fs.existsSync(configP) || !fs.existsSync(contentP)) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const json = getPage(<string>name)
    res.json({
        code: 200,
        msg: "操作成功",
        data: json

    });
});

myRouter.post("/addItem", (req, res) => {
    let { type, content, page, isPW, filename }: { type: PageItemTypeType, content: string; page: string, isPW: boolean; filename?: string; } = req.body;
    const pageContent = getPageContent(page)
    if (!pageContent) {
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
    const json: PageItemType = {
        type: type,
        content: content,
        createTime: new Date().getTime(),
        updateTime: new Date().getTime(),
        uuid: nanoid(32),
        isPW: isPW,
    };
    pageContent.list.push(json);
    fs.writeFileSync(path.join(pageContentDir, `${page}.json`), JSON.stringify(pageContent));

    res.json({
        code: 200,
        msg: "操作成功",
        data: pageContent
    });
});



myRouter.post("/editItem", (req, res) => {
    const { content, page, uuid, isPW }: { content: string; page: string; uuid: string, isPW: boolean; } = req.body;
    const pageContent = getPageContent(page)

    if (!pageContent) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const index = pageContent.list.findIndex(c => c.uuid == uuid);
    if (index == -1) {
        return res.json({
            code: 500,
            msg: "项目不存在",
            data: null
        });
    }
    const item = pageContent.list[index];
    if (item.type == 'image' && item.content != content) {
        return res.json({
            code: 500,
            msg: "图片不允许修改",
            data: null
        });
    }
    pageContent.list[index] = {
        ...pageContent.list[index],
        content: content,
        isPW: isPW,
        updateTime: new Date().getTime(),
    };
    fs.writeFileSync(path.join(pageContentDir, `${page}.json`), JSON.stringify(pageContent));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageContent
    });
});

myRouter.post("/deleteItem", (req, res) => {
    const { page, uuid }: { page: string; uuid: string; } = req.body;
    const pageContent = getPageContent(page)
    if (!pageContent) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const index = pageContent.list.findIndex(c => c.uuid == uuid);
    if (index == -1) {
        return res.json({
            code: 500,
            msg: "项目不存在",
            data: null
        });
    }
    // 图片需要删除
    if (pageContent.list[index].type == 'image') {
        const filepath = path.join(filesDir, pageContent.list[index].content);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    }
    pageContent.list.splice(index, 1);
    fs.writeFileSync(path.join(pageContentDir, `${page}.json`), JSON.stringify(pageContent));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageContent
    });
});

myRouter.post("/editPage", (req, res) => {
    const { name, title }: PageConfigType = req.body;
    const pageConfig = getPageConfig(name)

    if (!pageConfig) {
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
    pageConfig.title = title;
    fs.writeFileSync(path.join(pageConfigDir, `${name}.json`), JSON.stringify(pageConfig));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageConfig
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
    if (fs.existsSync(path.join(pageConfigDir, `${name}.json`))) {
        return res.json({
            code: 500,
            msg: "页面已存在",
            data: null
        });
    }
    const uuid = nanoid(32);
    const pageConfig: PageConfigType = {

        title: title,
        name: name,
        uuid: uuid,

    };
    fs.writeFileSync(path.join(pageConfigDir, `${name}.json`), JSON.stringify(pageConfig));
    const pageContent: PageContentType = {
        list: [],
        uuid: uuid,
    };
    fs.writeFileSync(path.join(pageContentDir, `${name}.json`), JSON.stringify(pageContent));
    const json: PageType = {
        list: [],
        config: pageConfig
    }
    res.json({
        code: 200,
        msg: "操作成功",
        data: json
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
    if (!fs.existsSync(path.join(pageConfigDir, `${name}.json`))) {
        return res.json({
            code: 500,
            msg: "匹配不上",
            data: null
        });
    }
    const configJson: PageConfigType = JSON.parse(fs.readFileSync(path.join(pageConfigDir, `${name}.json`), 'utf-8'));
    if (configJson.uuid != uuid) {
        return res.json({
            code: 500,
            msg: "匹配不上",
            data: null
        });
    }
    if (fs.existsSync(path.join(pageContentDir, `${name}.json`))) {
        const contentJson: PageContentType = JSON.parse(fs.readFileSync(path.join(pageContentDir, `${name}.json`), 'utf-8'));
        for (let i = 0; i < contentJson.list.length; i++) {
            const item = contentJson.list[i];
            if (item.type != 'image') {
                continue;
            }
            const p = path.join(filesDir, item.content);
            if (fs.existsSync(p)) {
                fs.unlinkSync(p);
            }
        }
        fs.unlinkSync(path.join(pageContentDir, `${name}.json`))
    }

    fs.unlinkSync(path.join(pageConfigDir, `${name}.json`));
    return res.json({
        code: 200,
        msg: "操作成功",
        data: getPage("index")
    });
});

myRouter.post("/toSendWX", async (req, res) => {
    const { page, uuid }: { page: string; uuid: string; } = req.body;
    const pageJson = getPageContent(page)
    if (!pageJson) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }

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