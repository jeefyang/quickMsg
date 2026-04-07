type PageConfigType = {
    name: string;
    title: string;
};

type PageItemTypeType = "text" | "image" | "md";

type PageItemType = {
    type: PageItemTypeType;
    content: string;
    createTime: number;
    updateTime: number;
    uuid: string;
    isPW?: boolean;
    /** 用于操作,不保存的 */
    _switchNoPW?: boolean;
};

type PageType = {
    config: PageConfigType;
    list: PageItemType[];
};

type ConfigType = {
    isWxSend?: boolean;
    wxSendUrl?: string;
};