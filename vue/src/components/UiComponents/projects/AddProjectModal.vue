<script setup lang="ts">
import { ref } from "vue";
import Button from "../form/Button.vue";
import ajaxAxios from "../../../utils/axios";
import { imageInterface } from "@/types/components";
import UploadImg from "@components/UiComponents/form/UploadImg.vue";
import Input from "../form/Input.vue";
import { useProjectStore } from "@/src/stores/useProject";
import { showToast } from "@/src/composables/helpers";
import { useMetaStore } from "@/src/stores/useMeta";

const emit = defineEmits<{
  (e: "close"): void;
}>();
const projectStore = useProjectStore();
const metaStore = useMetaStore();

const title = ref("");
const selectedImage = ref<imageInterface[] | null>(null);
const fileRef = ref();
const fileContent = ref("");

const onFormSubmits = async () => {
  if (!selectedImage.value?.length || !title.value) {
    showToast("error", "Required fields missing!");
    return;
  }

  try {
    const { data } = await ajaxAxios.post("", {
      action: "irep_create_project",
      nonce: irePlugin.nonce,
      title: title.value,
      project_image: selectedImage.value?.[0]?.id,
      svg: ""
    });

    if (data.success) {
      emit("close");
      showToast("success", "Project created successfully!");
      projectStore.fetchProjects(null);

      const colors = [
        {
          key: "path_color",
          value: ""
        },
        {
          key: "path_hover_color",
          value: ""
        },
        {
          key: "reserved_color",
          value: ""
        },
        {
          key: "sold_color",
          value: ""
        },
        {
          key: "stroke_color",
          value: ""
        },
        {
          key: "stroke_width",
          value: 0
        }
      ];

      metaStore.setProjectMeta([...colors], data?.data?.project_id);
    } else {
      showToast("error", data?.data || "Something went wrong!");
    }
  } catch (error) {
    console.log("errorrr", error);
    showToast("error", "Something went wrong!");
  }
};

const readFile = (file: any) => {
  const reader = new FileReader(); // Create a FileReader instance

  // Define what happens when the file is read
  reader.onload = (e: any) => {
    try {
      const content = JSON.parse(e.target.result); // Parse the JSON content
      fileContent.value = content; // Store the parsed content
      console.log("File content:", content);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      alert("Invalid JSON file.");
    }
  };

  // Define what happens if there's an error reading the file
  reader.onerror = (error) => {
    console.error("Error reading file:", error);
    alert("Error reading file.");
  };

  reader.readAsText(file); // Read the file as text
};

const handleFileChange = (event: any) => {
  const file = event.target?.files?.[0];

  if (file && file.type === "application/json") {
    readFile(file);
  } else {
    alert("Please select a valid .json file.");
    fileContent.value = "";
    fileRef.value.value = null;
  }
};

const importProject = async () => {
  if (!fileContent.value) return;

  const { data } = await ajaxAxios.post("", {
    action: "irep_import",
    nonce: irePlugin.nonce,
    data: fileContent.value
  });
};
</script>

<template>
  <div>
    <h3 class="!mb-4 min-w-80 !text-lg font-semibold">Add New Project</h3>

    <form class="flex flex-col gap-3" @submit.prevent="onFormSubmits">
      <Input v-model="title" placeholder="project title" required></Input>
      <UploadImg v-model="selectedImage" title="upload project image" required />

      <Button title="Add project" type="submit" />

      <div class="flex items-center justify-center">
        <span>or</span>
      </div>

      <label>
        <p>Import project</p>
        <input ref="fileRef" type="file" name="project" @change="handleFileChange" />
      </label>

      <Button title="Import" :outlined="true" @click="importProject" />
    </form>
  </div>
</template>
