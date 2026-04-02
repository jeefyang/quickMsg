type PageConfigType = {
    name: string;
    title: string;
};

type PageItemTypeType = "text" | "img" | "md";

type PageItemType = {
    type: PageItemTypeType;
    content: string;
    createTime: number;
    updateTime: number;
    uuid: string;
};

type PageType = {
    config: PageConfigType;
    list: PageItemType[];
};