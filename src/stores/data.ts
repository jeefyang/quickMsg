import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useDataStore = defineStore('data', () => {

    const isInit = ref(false);
    const list = ref(<string[]>[]);

    const pageData = ref(<PageType>{
        list: [], config: { name: "", title: "" }
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

    return { isInit, list, pageData, getDateFn };
});
