declare module 'microlighter';

type PageConfigType = {
    name?: string;
    title: string;
    uuid: string;
    secondCode?: string;
    defaultSecret?: boolean;
    defaultContentFile?: boolean;
};

type PageEditConfigType = PageConfigType & {
    editSecondCode?: string;
};

type PageItemTypeType = "text" | "image" | "markdown" | "code";

type PageItemEditType = Omit<PageItemType, {
    createTime: number;
    updateTime: number;
}> & {
    type?: PageItemTypeType;
    /** 二次验证 */
    secondCode?: string;
    filename?: string;
    page: string;
};

type PageItemType = {
    type: PageItemTypeType;
    content: string;
    createTime: number;
    updateTime: number;
    uuid: string;
    isSecret?: boolean;
    /** 代码语言 */
    codeLang?: LangType;
    /** 标签 */
    tags?: string[];
    /** 是否内容文件化 */
    isContentFile?: boolean;
};

type PageItemCacheType = PageItemType & {
    /** 用于操作,不保存的 */
    _switchNoSecret?: boolean;
    _contentFileUrl?: string;
};


type PageType = {
    config: PageEditConfigType;
    list: PageItemType[];
};

type pageCacheType = {
    config: PageEditConfigType;
    list: PageItemCacheType[];
};


type PageContentType = {
    list: PageItemType[];
    uuid: string;
};

type ConfigType = {
    isWxSend?: boolean;
    wxSendUrl?: string;
    /** 用于验证(仅首页可以) */
    page: string;
    /** 用于验证(仅首页可以) */
    secondCode?: string;
};

type LangType =
    | 'javascript'
    | 'html'
    | 'typescript'
    | 'vue'
    | 'yaml'
    | 'markdown'
    | 'json'
    | 'python'
    | 'powershell'
    | 'toml'
    | 'assembly'
    | 'bash'
    | 'c'
    | 'cpp'
    | 'csharp'
    | 'css'
    | 'dart'
    | 'dockerfile'
    | 'elixir'
    | 'git-diff'
    | 'go'
    | 'graphql'
    | 'heex'
    | 'java'
    | 'kotlin'
    | 'lua'
    | 'objective-c'
    | 'perl'
    | 'php'
    | 'r'
    | 'ruby'
    | 'rust'
    | 'scss'
    | 'sql'
    | 'svelte'
    | 'swift'
    | 'tsx';