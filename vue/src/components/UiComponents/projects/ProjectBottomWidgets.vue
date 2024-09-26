<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useProjectStore } from "../../../stores/useProject";
import { useToast } from "vue-toast-notification";
import ajaxAxios from "@/src/utils/axios";
import Button from "../form/Button.vue";
import { resetCanvasAfterSave } from "@/src/composables/helpers";
import Input from "../form/Input.vue";
import UploadImg from "../form/UploadImg.vue";
import { onMounted, ref, watch } from "vue";
import { imageInterface } from "@/types/components";

const $toast = useToast();
const projectStore = useProjectStore();

const { id, title, slug, polygon_data, svgRef, activeGroup, project_image, isContainImage } = storeToRefs(projectStore);

const projectImage = ref<imageInterface[] | null>(null);

const toogleCoverMeta = async () => {
  await ajaxAxios.post("", {
    action: "ire_create_or_update_meta",
    nonce: irePlugin.nonce,
    project_id: id.value,
    meta_key: "project_img_contain",
    meta_value: !JSON.parse(isContainImage.value || "false")
  });

  projectStore.getProjectMeta();
};

const updateProject = async () => {
  if (svgRef.value) {
    resetCanvasAfterSave(svgRef.value);
  }

  const params: any = {
    projectId: id.value,
    title: title.value,
    slug: slug.value,
    svg: svgRef.value?.querySelector("svg")?.outerHTML || "",
    polygon_data: polygon_data.value
  };

  if (project_image.value) {
    params.project_image = project_image.value.id;
  }

  try {
    await ajaxAxios.post("", {
      action: "update_project",
      nonce: irePlugin.nonce,
      ...params
    });

    activeGroup.value = null;

    $toast.success("Project Updated!", {
      position: "top"
    });
  } catch (error) {
    $toast.error("Something went wrong!", {
      position: "top"
    });
  }
};

watch(
  () => projectImage.value,
  (ns) => {
    if (ns) {
      project_image.value = ns[0];
    }
  }
);

onMounted(() => {
  projectImage.value = project_image.value?.id ? [project_image.value] : null;
});
</script>

<template>
  <div class="my-7 flex items-start justify-between">
    <div class="flex gap-5">
      <div class="flex flex-col items-start gap-5 rounded-md bg-white p-4">
        <div class="flex flex-col gap-2">
          <label for="" class="font-semibold">Project Title:</label>

          <Input v-model="title" />
        </div>

        <div class="flex w-full items-center justify-between gap-2">
          <div>
            <p class="font-semibold">object-fit: contain</p>
            <p class="mb-1 text-xs italic text-gray-500">default is cover</p>
          </div>
          <input type="checkbox" v-model="isContainImage" @change="toogleCoverMeta" />
        </div>

        <div>
          <div class="font-semibold">Shortcode:</div>
          <p>[ire_project id=”{{ projectStore?.id }}″]</p>
        </div>
      </div>

      <div class="w-60 rounded-md bg-white p-4">
        <UploadImg v-model="projectImage" title="Upload project image" required />

        <!-- <p class="mb-1 font-semibold">Change project image</p>
        <img :src="selectedImages?.[0]?.url || project_image" class="h-32 w-full rounded-md" />
        <button class="!mt-2 w-full border border-dashed py-2 transition-all hover:bg-gray-50" @click="selectImage">
          Upload
        </button> -->
      </div>
    </div>

    <div class="flex flex-col items-end gap-3">
      <div class="flex"></div>
      <Button title="Update" outlined @click="updateProject" />
    </div>
  </div>
</template>
