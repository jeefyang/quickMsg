import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';
import "virtual:uno.css";



const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');

class EditableCode extends HTMLElement {
    connectedCallback() {
        const code = this.querySelector("pre > code");
        if (!code) return;
        // @ts-ignore
        code.contentEditable = "plaintext-only";
        // @ts-ignore
        code.spellcheck = false;
        code;
        code.setAttribute("aria-label", "Editable code");
        this.addEventListener("input", () => {
            this.dispatchEvent(new Event("syntax-highlight", { bubbles: true }));
        });
    }
}

customElements.define("editable-code", EditableCode);

