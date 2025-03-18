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
</script>

<template>
  <div>
    <h3 class="!mb-4 min-w-80 !text-lg font-semibold">Add New Project</h3>

    <form class="flex flex-col gap-3" @submit.prevent="onFormSubmits">
      <Input v-model="title" placeholder="project title" required></Input>
      <UploadImg v-model="selectedImage" title="upload project image" required />

      <Button title="Add project" type="submit" />
    </form>
  </div>
</template>
