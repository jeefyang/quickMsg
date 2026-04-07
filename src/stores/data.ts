import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useDataStore = defineStore('data', () => {

    const isInit = ref(false);
    const pageList = ref(<string[]>[]);

    const config = ref(<ConfigType>{});

    const pageData = ref(<PageType>{
        list: [], config: { name: "", title: "" }
    });

    const itemList = ref(<PageItemType[]>[]);

    const filterData = ref({
        types: <PageItemTypeType[]>[],
        sort: <-1 | 1>1,
        keyword: "",
        startUpdateTime: <number | null>null,
        endUpdateTime: <number | null>null,
        startCreatTime: <number | null>null,
        endCreatTime: <number | null>null,
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

    const setPageData = (data: PageType) => {
        pageData.value = data;
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

    return { isInit, pageList, pageData, getDateFn, itemList, setPageData, filterData, setFilter, config };
});
