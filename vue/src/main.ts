import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);

app.config.globalProperties.irePlugin = irePlugin;
// @ts-ignore
window.constants = {
  CIRCLE_RADIUS: 4,
  HOVER_CIRCLE_RADIUS: 12,
  PATH_COLOR: "#87cefa86",
  SELECTED_PATH_COLOR: "#ffea006c	",
  NON_SELECTED_PATH_COLOR: "#87cefa22",
  CIRCLE_COLOR: "white",
  CIRCLE_HOVER_COLOR: "rgba(255, 255, 255, 0.70)"
};

app.mount("#my-vue-app");
