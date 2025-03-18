<script setup lang="ts">
import ajaxAxios from "@/src/utils/axios";
import { ref } from "vue";
import Button from "../form/Button.vue";
import { showToast } from "@/src/composables/helpers";
import { useProjectStore } from "@/src/stores/useProject";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const projectStore = useProjectStore();

const loading = ref(false);
const fileRef = ref();
const fileContent = ref("");

const importProject = async () => {
  if (loading.value) return;

  if (!fileContent.value) {
    showToast("error", "Please upload json file!");
    return;
  }

  loading.value = true;
  const { data } = await ajaxAxios.post("", {
    action: "irep_import",
    nonce: irePlugin.nonce,
    data: fileContent.value
  });

  loading.value = false;

  if (data.success) {
    showToast("success", "Project imported successfully!");
    await projectStore.fetchProjects(null);
    emit("close");
  }
};

const readFile = (file: any) => {
  const reader = new FileReader();

  reader.onload = (e: any) => {
    try {
      const content = JSON.parse(e.target.result); // Parse the JSON content
      fileContent.value = content; // Store the parsed content
      console.log("File content:", content);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      showToast("error", "Invalid JSON file.");
    }
  };

  reader.onerror = (error) => {
    console.error("Error reading file:", error);
    showToast("error", "Error reading file.");
  };

  reader.readAsText(file); // Read the file as text
};

const handleFileChange = (event: any) => {
  const file = event.target?.files?.[0];

  if (file && file.type === "application/json") {
    readFile(file);
  } else {
    showToast("error", "Please select a valid .json file.");

    fileContent.value = "";
    fileRef.value.value = null;
  }
};
</script>
<template>
  <div>
    <label>
      <p>Import project</p>
      <input ref="fileRef" type="file" name="project" @change="handleFileChange" />
    </label>

    <Button title="Import" :outlined="true" @click="importProject" class="mt-4" />
  </div>
</template>
