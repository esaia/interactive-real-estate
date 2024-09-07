import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

app.config.globalProperties.irePlugin = irePlugin;

app.mount("#my-vue-app");
