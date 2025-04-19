import IrePreview, { Project } from "./lib/irePreview.js";

function addProject(selector, projectId) {
  if (!Vue) return;

  const { createApp, ref, onMounted } = Vue;

  const app = createApp({
    setup() {
      const shortcodeData = ref(null);
      const loading = ref(false);

      const translations = irePluginWp.translations || [];

      const fetchData = async () => {
        loading.value = true;
        try {
          const response = await fetch(irePluginWp.ajax_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              action: "irep_get_shortcode_data",
              nonce: irePluginWp.nonce,
              project_id: projectId,
            }),
          });

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();

          if (data.success) {
            shortcodeData.value = data.data;
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          loading.value = false;
        }
      };

      // Fetch data when component is mounted
      onMounted(fetchData);

      return {
        shortcodeData,
        loading,
        translations,
      };
    },
    components: {
      Project,
    },
    template: `
    <div class="irep-container">
      <div v-if="loading" class="irep-loading-container">
        <div class="irep-loading-spinner">
          <div class="irep-spinner"></div>
        </div>
      </div>

      <Project v-else-if="shortcodeData" :data="shortcodeData"  :translations="translations" />

      <div v-else class="irep-no-data">
        {{ translations['no data available'] }}
      </div>
    </div>
  `,
  });

  app.use(IrePreview);

  app.mount(selector);
}

document.body
  .querySelectorAll("[id^='irep-shortcode-']")
  .forEach((shortcodeElement) => {
    if (shortcodeElement.tagName === "SCRIPT") return;

    const projectId = shortcodeElement.getAttribute("data-project-id");
    const elId = shortcodeElement.getAttribute("id");

    addProject(`#${elId}`, projectId);
  });
