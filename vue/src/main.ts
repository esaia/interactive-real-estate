import { createApp } from "vue";
import App from "./App.vue";
import Shortcode from "@/src/components/ShortcodeComponents/ShortCode.vue";
import { createPinia } from "pinia";
import ToastPlugin from "vue-toast-notification";
import VueAwesomePaginate from "vue-awesome-paginate";
import "vue-awesome-paginate/dist/style.css";
// @ts-ignore
import vClickOutside from "click-outside-vue3";
import Vue3ColorPicker from "vue3-colorpicker";
import "vue3-colorpicker/style.css";
import "ire-preview/dist/styles.css";
import "./style.css";
import "highlight.js/styles/stackoverflow-light.css";
import "highlight.js/lib/common";
import hljsVuePlugin from "@highlightjs/vue-plugin";

const pinia = createPinia();
const app = createApp(App);

app.use(vClickOutside);
app.use(pinia);
app.use(VueAwesomePaginate);
app.use(ToastPlugin);
app.use(Vue3ColorPicker);
app.use(hljsVuePlugin);

app.config.globalProperties.irePlugin = irePlugin;
// @ts-ignore
window.constants = {
  CIRCLE_RADIUS: 4,
  HOVER_CIRCLE_RADIUS: 12,
  PATH_COLOR: "#cb443579",
  SELECTED_PATH_COLOR: "#cb4435af	",
  NON_SELECTED_PATH_COLOR: "#cb443529",
  CIRCLE_COLOR: "#ffff",
  CIRCLE_HOVER_COLOR: "rgba(255, 255, 255, 0.70)",

  PREVIEW_PATH_COLOR: "rgba(255, 255, 255, 0.3)",
  PREVIEW_PATH_HOVER_COLOR: "rgba(250, 250, 250, 0.54)",
  PREVIEW_RESERVED_COLOR: "rgba(255, 247, 89, 0.53)",
  PREVIEW_SOLD_COLOR: "rgba(219, 64, 64, 0.45)",
  PREVIEW_STROKE_COLOR: "rgba(0, 0, 0,  1)",
  PREVIEW_STROKE_WIDTH: 1,
  PREVIEW_BORDER_RADIUS: 0,
  TOOLTIP: 0
};

app.mount("#irep-vue-app");

document.querySelectorAll("[id^='irep-shortcode-']").forEach((shortcodeElement) => {
  const projectId = shortcodeElement.getAttribute("data-project-id");
  const shortcodeApp = createApp(Shortcode, { projectId });

  shortcodeApp.use(vClickOutside);

  shortcodeApp.mount(shortcodeElement);
});
