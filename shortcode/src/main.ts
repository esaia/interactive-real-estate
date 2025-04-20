import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import IrePreview from "ire-preview";
import "ire-preview/dist/styles.css";

// const app = createApp(App);

// app.use(IrePreview);

// app.mount("#my-aapp");

document.body.querySelectorAll("[id^='irep-shortcode-']").forEach((shortcodeElement) => {
  if (shortcodeElement.tagName === "SCRIPT") return;

  const projectId = shortcodeElement.getAttribute("data-project-id");
  const shortcodeApp = createApp(App, { projectId });

  shortcodeApp.config.globalProperties.irePluginWp = irePluginWp;

  shortcodeApp.use(IrePreview);

  shortcodeApp.mount(shortcodeElement);
});
