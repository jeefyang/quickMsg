import { ref, computed } from 'vue';
import { defineStore } from 'pinia';


export const useDataStore = defineStore('data', () => {

    const isInit = ref(false);
    const isEmpty = ref(false);
    const pageList = ref(<PageConfigType[]>[]);

    const config = ref(<ConfigType>{});

    const pageData = ref(<pageCacheType>{
        list: [], config: { name: "", title: "", uuid: "", secondCode: "" }
    });
    const cacheContent: Record<string, {
        content: string;
        updateTime: number;
    }> = {};

    const tagList = ref<{ label: string, value: string; }[]>([]);


    const itemList = ref(<PageItemCacheType[]>[]);

    const filterData = ref({
        types: <PageItemTypeType[]>[],
        sort: <-1 | 1>1,
        keyword: "",
        startUpdateTime: <number | null>null,
        endUpdateTime: <number | null>null,
        startCreatTime: <number | null>null,
        endCreatTime: <number | null>null,
        tags: <string[]>[],
    });


    const getDateFn = (time: number) => {
        const date = new Date(time);
        const yy = (date.getFullYear() % 100).toString().padStart(2, '0');
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = (date.getDate()).toString().padStart(2, '0');
        const h = (date.getHours()).toString().padStart(2, '0');
        const m = (date.getMinutes()).toString().padStart(2, '0');
        const s = (date.getSeconds()).toString().padStart(2, '0');
        return `${yy}-${mm}-${dd}_${h}:${m}:${s}`;
    };

    const updateContentList = async () => {
        tagList.value = [];
        if (!pageData.value.list) {
            return;
        }
        const list: PageItemCacheType[] = [];
        for (let i = 0; i < pageData.value.list.length; i++) {
            const item = pageData.value.list[i];
            if (item?.tags) {
                for (let j = 0; j < item.tags.length; j++) {
                    const tag = item.tags[j];
                    if (!tagList.value.some(item => item.value == tag)) {
                        tagList.value.push({ label: tag!, value: tag! });
                    }
                }
            }
            if (item?.type == "image" || !item?.isContentFile) {
                continue;
            }
            if (!item._contentFileUrl) {
                item._contentFileUrl = `api/files/${item.content}`;
            }
            item.content = "";
            list.push(item);
        }
        for (let i = 0; i < list.length; i++) {
            const item = list[i]!;
            if (cacheContent[item.uuid]?.updateTime == item.updateTime) {
                item.content = cacheContent[item.uuid]?.content || "";
                continue;
            }
            const res = await fetch(item._contentFileUrl!);
            item.content = await res.text();
            cacheContent[item.uuid] = {
                content: item.content,
                updateTime: item.updateTime
            };
        }
    };

    const setPageData = (data: pageCacheType | PageConfigType | PageContentType, type: "config" | "content" | "all") => {
        if (type == "config") {
            pageData.value.config = (<PageConfigType>data);

        }
        else if (type == "content") {
            pageData.value.list = (<PageContentType>data).list;
            updateContentList();
        }
        else {
            pageData.value = <pageCacheType>data;
            updateContentList();

        }
        setFilter();

    };

    const setFilter = () => {

        let list = [...pageData.value.list];
        list = list.filter(item => {
            if (filterData.value.types.length > 0 && !filterData.value.types.includes(item.type)) {
                return false;
            }
            if (filterData.value.keyword && !item.content.includes(filterData.value.keyword)) {
                return false;
            }
            if (filterData.value.tags && filterData.value.tags.length > 0) {
                if (!item.tags) {
                    return false;
                }
                if (!item.tags.some(tag => filterData.value.tags.includes(tag))) {
                    return false;
                }
            }
            if (filterData.value.startUpdateTime) {
                if (item.updateTime < filterData.value.startUpdateTime) {
                    return false;
                }
            }
            if (filterData.value.endUpdateTime) {
                if (item.updateTime > filterData.value.endUpdateTime) {
                    return false;
                }
            }
            if (filterData.value.startCreatTime) {
                if (item.createTime < filterData.value.startCreatTime) {
                    return false;
                }
            }
            if (filterData.value.endCreatTime) {
                if (item.createTime > filterData.value.endCreatTime) {
                    return false;
                }
            }
            return true;
        });
        if (filterData.value.sort === -1) {
            list.reverse();
        }
        itemList.value = list;
    };

    const updatePageList = async () => {
        const res = await (await fetch('./api/list')).json();
        if (res.code != 200 || !res.data) {
            return res;
        }
        pageList.value = res.data;
        return res;
    };

    const updatePageData = async (name?: string, secondCode?: string) => {
        const res = await (await fetch(`./api/page?name=${name || pageData.value.config.name}&secondCode=${secondCode || ""}`)).json();
        if (res.code != 200 || !res.data) {
            return res;
        }
        setPageData(res.data, "all");
        // 获取当前URL参数
        const urlParams = new URLSearchParams(window.location.search);

        // 更新特定参数
        urlParams.set('pageName', pageData.value.config.name!);
        urlParams.set('secondCode', secondCode || "");

        // 替换当前状态
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        history.replaceState({ pageName: pageData.value.config.name, secondCode: secondCode || "" }, '', newUrl);
        return res;
    };

    const updateConfig = async () => {

        const res = await (await fetch(`./api/getConfig?page=${getPageName()}&secondCode=${getSecondCode()}`)).json();
        if (res.code != 200 || !res.data) {
            return res;
        }
        config.value = res.data;
        return res;
    };

    const getSecondCode = () => {
        return new URLSearchParams(window.location.search).get('secondCode') || '';
    };

    const getPageName = () => {
        return new URLSearchParams(window.location.search).get('pageName') || 'index';
    };

    return { isInit, isEmpty, pageList, pageData, getDateFn, itemList, setPageData, filterData, setFilter, config, updatePageList, updatePageData, updateConfig, getSecondCode, getPageName, tagList };
});
