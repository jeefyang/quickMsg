import { Router } from 'express';
import fs from "fs";
import { nanoid } from 'nanoid';
import path from 'path';
import axios from "axios";
import sharp from 'sharp';
import multer from 'multer';

const myRouter: Router = Router();
const configPath = "./data/config.json";
const filesDir = "./data/files";
const pageConfigDir = "./data/page/config";
const pageContentDir = "./data/page/content";



if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
}

if (!fs.existsSync(pageConfigDir)) {
    fs.mkdirSync(pageConfigDir, { recursive: true });
}

if (!fs.existsSync(pageContentDir)) {
    fs.mkdirSync(pageContentDir, { recursive: true });
}



// 文件过滤器（可选，此处允许所有文件类型）
const fileFilter = (req: any, file: any, cb: (err: any, acceptFile: boolean) => void) => {
    // 允许所有类型，如需限制可在此判断 file.mimetype
    cb(null, true);
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 50 } // 50MB 限制
});


const getConfig = () => {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, "{}");
    }
    const config: ConfigType = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
};

const getPageContent = (name: string): PageContentType | undefined => {
    if (!name) {
        return undefined;
    }
    const p = path.join(pageContentDir, `${name}.json`);
    if (!fs.existsSync(p)) {
        return undefined;
    }
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
};

const getPageConfig = (name: string, ext = ".json"): PageConfigType | undefined => {
    if (!name) {
        return undefined;
    }
    const p = path.join(pageConfigDir, `${name}${ext}`);
    if (!fs.existsSync(p)) {
        return undefined;
    }
    return JSON.parse(fs.readFileSync(p, 'utf-8'));

};

const getPage = (name: string) => {
    const config = getPageConfig(<string>name)!;
    const content = getPageContent(<string>name)!;
    const json: PageType = {
        config,
        list: content.list
    };
    return json;
};

myRouter.get('/getConfig', (req, res) => {
    const query: Partial<ConfigType> = req.query;
    if (!query.page) {
        return res.json({
            code: 500,
            msg: "缺少参数",
        });
    }
    const indexPage = getPageConfig(query.page!);
    if (!indexPage || (indexPage.secondCode || "") != query.secondCode) {
        return res.json({
            code: 500,
            msg: "参数错误",
        });
    }
    const config = getConfig();
    return res.json({
        code: 200,
        msg: "操作成功",
        data: config
    });
});

myRouter.post('/editConfig', (req, res) => {
    const body: Partial<ConfigType> = req.body;
    /** 仅index页面可以修改 */
    if (!body.page || body.page != 'index') {
        return res.json({
            code: 500,
            msg: "缺少参数",
        });
    }
    const indexPage = getPageConfig(body.page!);
    if (!indexPage || (indexPage.secondCode || "") != body.secondCode) {
        return res.json({
            code: 500,
            msg: "参数错误",
        });
    }
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
        fs.writeFileSync(path.join(pageContentDir, list[0]), JSON.stringify(contentJson));
    }
    const data = list.map(c => {
        const json = getPageConfig(c, "");
        if (json) {
            delete json.secondCode;
        }
        return json;
    });
    res.json({
        code: 200,
        msg: "操作成功",
        data
    });
});

myRouter.get('/page', (req, res) => {
    const { name, secondCode } = req.query;
    const configP = path.join(pageConfigDir, `${name}.json`);
    const contentP = path.join(pageContentDir, `${name}.json`);
    if (!fs.existsSync(configP) || !fs.existsSync(contentP)) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const config = getPageConfig(<string>name);
    if (!config || (config.secondCode || '') != secondCode) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const json = getPage(<string>name);
    res.json({
        code: 200,
        msg: "操作成功",
        data: json

    });
});

myRouter.post("/addItem", (req, res) => {
    const body: PageItemEditType = { ...req.body };

    const pageConfig = getPageConfig(body.page);
    if (!pageConfig || (pageConfig.secondCode || '') != body.secondCode) {
        return res.json({
            code: 500,
            msg: "页面不存在",
        });
    }
    const pageContent = getPageContent(body.page);
    if (!pageContent) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    if (!body.content || (body.type == 'code' && !body.codeLang)) {
        return res.json({
            code: 500,
            msg: "内容缺失",
            data: null
        });
    }
    const uuid = nanoid(32);
    if (body.type == 'image') {
        if (!body.filename) {
            return res.json({
                code: 500,
                msg: "文件名缺失",
                data: null
            });
        }
        const ext = path.extname(body.filename);
        const newFilename = `${nanoid(32)}${ext}`;
        // 1. 去除前缀 (使用正则匹配 data:image/xxx;base64,)
        const base64String = body.content.replace(/^data:image\/\w+;base64,/, '');

        // 2. 将 Base64 字符串转换为 Buffer
        const imageBuffer = Buffer.from(base64String, 'base64');
        fs.writeFileSync(path.join(filesDir, newFilename), imageBuffer);
        body.content = newFilename;
    }
    else if (body.isContentFile) {
        const content = body.content;
        const filename = `${body.page}_${nanoid(32)}.txt`;
        fs.writeFileSync(path.join(filesDir, filename), content);
        body.content = filename;
    }
    const json: PageItemType = {
        type: body.type,
        content: body.content,
        createTime: new Date().getTime(),
        updateTime: new Date().getTime(),
        uuid,
        isSecret: body.isSecret,
        codeLang: body.type == "code" ? body.codeLang : undefined,
        isContentFile: body.isContentFile,
        tags: body.tags || []

    };
    pageContent.list.push(json);
    fs.writeFileSync(path.join(pageContentDir, `${body.page}.json`), JSON.stringify(pageContent));

    res.json({
        code: 200,
        msg: "操作成功",
        data: pageContent
    });
});



myRouter.post("/editItem", (req, res) => {
    const body: PageItemEditType = { ...req.body };


    const pageConfig = getPageConfig(body.page);
    if (!pageConfig || (pageConfig.secondCode || "") != body.secondCode) {
        return res.json({
            code: 500,
            msg: "页面不存在",
        });
    }
    const pageContent = getPageContent(body.page);

    if (!pageContent) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const index = pageContent.list.findIndex(c => c.uuid == body.uuid);
    if (index == -1) {
        return res.json({
            code: 500,
            msg: "项目不存在",
            data: null
        });
    }
    const item = pageContent.list[index];
    if (item.type == 'image' && item.content != body.content) {
        return res.json({
            code: 500,
            msg: "图片不允许修改",
            data: null
        });
    }
    if (item.isContentFile) {
        fs.writeFileSync(path.join(filesDir, item.content), body.content);
        body.content = item.content;
    }
    pageContent.list[index] = {
        ...pageContent.list[index],
        content: body.content,
        isSecret: body.isSecret,
        updateTime: new Date().getTime(),
        codeLang: body.codeLang,
        tags: body.tags || pageContent.list[index].tags || []
    };
    fs.writeFileSync(path.join(pageContentDir, `${body.page}.json`), JSON.stringify(pageContent));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageContent
    });
});

myRouter.post("/deleteItem", (req, res) => {
    const body: PageItemEditType = { ...req.body };

    const pageConfig = getPageConfig(body.page);
    if (!pageConfig || (pageConfig.secondCode || "") != body.secondCode) {
        return res.json({
            code: 500,
            msg: "页面不存在",
        });
    }
    const pageContent = getPageContent(body.page);
    if (!pageContent) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    const index = pageContent.list.findIndex(c => c.uuid == body.uuid);
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
    fs.writeFileSync(path.join(pageContentDir, `${body.page}.json`), JSON.stringify(pageContent));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageContent
    });
});

myRouter.post("/editPage", (req, res) => {
    const body: PageEditConfigType = req.body;
    const pageConfig = getPageConfig(body.name!);

    if (!pageConfig || (pageConfig.secondCode || "") != body.secondCode) {
        return res.json({
            code: 500,
            msg: "页面不存在",
            data: null
        });
    }
    if (!body.title) {
        return res.json({
            code: 500,
            msg: "请填写标题",
            data: null
        });
    }
    pageConfig.title = body.title;
    pageConfig.secondCode = body.editSecondCode || "";
    pageConfig.defaultContentFile = body.defaultContentFile;
    pageConfig.defaultSecret = body.defaultSecret;
    fs.writeFileSync(path.join(pageConfigDir, `${body.name}.json`), JSON.stringify(pageConfig));
    res.json({
        code: 200,
        msg: "操作成功",
        data: pageConfig
    });
});

myRouter.post("/addPage", (req, res) => {
    const body: PageConfigType = req.body;
    if (!body.name) {
        return res.json({
            code: 500,
            msg: "请填写页面名称",
            data: null
        });
    }
    if (!body.title) {
        return res.json({
            code: 500,
            msg: "请填写标题",
            data: null
        });
    }
    if (fs.existsSync(path.join(pageConfigDir, `${body.name}.json`))) {
        return res.json({
            code: 500,
            msg: "页面已存在",
            data: null
        });
    }
    const uuid = nanoid(32);
    const pageConfig: PageConfigType = {

        title: body.title,
        name: body.name,
        uuid: uuid,
        secondCode: body.secondCode || "",
        defaultContentFile: body.defaultContentFile,
        defaultSecret: body.defaultSecret

    };
    fs.writeFileSync(path.join(pageConfigDir, `${body.name}.json`), JSON.stringify(pageConfig));
    const pageContent: PageContentType = {
        list: [],
        uuid: uuid,
    };
    fs.writeFileSync(path.join(pageContentDir, `${body.name}.json`), JSON.stringify(pageContent));
    const json: PageType = {
        list: [],
        config: pageConfig
    };
    res.json({
        code: 200,
        msg: "操作成功",
        data: json
    });
});

myRouter.post("/deletePage", (req, res) => {
    const { uuid, name, secondCode }: { uuid: string, name: string; secondCode?: string; } = req.body;
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
    if (configJson.uuid != uuid || configJson.secondCode != secondCode) {
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
        fs.unlinkSync(path.join(pageContentDir, `${name}.json`));
    }

    fs.unlinkSync(path.join(pageConfigDir, `${name}.json`));
    return res.json({
        code: 200,
        msg: "操作成功",
        data: getPage("index")
    });
});

myRouter.post("/toSendWX", async (req, res) => {
    const { page, secondCode, uuid }: { page: string; secondCode?: string; uuid: string; } = req.body;
    const pageConfig = getPageConfig(page);
    if (!pageConfig || (pageConfig.secondCode || "") != secondCode) {
        return res.json({
            code: 500,
            msg: "页面不存在",
        });
    }
    const pageJson = getPageContent(page);
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

myRouter.post("/uploadFile", upload.single('file'), async (req, res) => {

    try {
        if (!req.file) {
            return res.json({
                code: 500,
                msg: "没有收到文件",
                data: null
            });
        }

        const uniqueSuffix = Date.now().toString(32) + '_' + nanoid(12);
        const ext = path.extname(req.file.originalname);
        const basename = req.body.replaceBasename || path.basename(req.file.originalname, ext);
        const newfilename = `${basename}_${uniqueSuffix}${ext}`;

        fs.writeFileSync(path.join(filesDir, newfilename), req.file.buffer);

        // 返回成功信息
        res.json({
            code: 200,
            msg: "上传成功",
            data: {
                filename: newfilename
            }
        });
    } catch (error) {
        console.error('上传处理错误:', error);
        return res.json({
            code: 500,
            msg: "上传识别",
            data: null
        });
    }
});

export default myRouter;