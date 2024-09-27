import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Shortcode from "./Shortcode.vue";
import { createPinia } from "pinia";
import ToastPlugin from "vue-toast-notification";
import VueAwesomePaginate from "vue-awesome-paginate";
import "vue-awesome-paginate/dist/style.css";
// @ts-ignore
import vClickOutside from "click-outside-vue3";

const pinia = createPinia();
const app = createApp(App);
const shortcode = createApp(Shortcode);

shortcode.use(vClickOutside);
app.use(vClickOutside);
app.use(pinia);
app.use(VueAwesomePaginate);
app.use(ToastPlugin);

app.config.globalProperties.irePlugin = irePlugin;
// @ts-ignore
window.constants = {
  CIRCLE_RADIUS: 4,
  HOVER_CIRCLE_RADIUS: 12,
  PATH_COLOR: "#cb443579",
  SELECTED_PATH_COLOR: "#cb4435af	",
  NON_SELECTED_PATH_COLOR: "#cb443529",
  CIRCLE_COLOR: "#ffff",
  CIRCLE_HOVER_COLOR: "rgba(255, 255, 255, 0.70)"
};

app.mount("#my-vue-app");
shortcode.mount("#ire-shortcode");
