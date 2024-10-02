<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useProjectStore } from "../../../../stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import { resetCanvasAfterSave, showToast } from "@/src/composables/helpers";
import { onMounted, ref, watch } from "vue";
import { imageInterface } from "@/types/components";
import UploadImg from "../../form/UploadImg.vue";
import Input from "../../form/Input.vue";
import Button from "../../form/Button.vue";
import ColorVariables from "./ColorVariables.vue";

const projectStore = useProjectStore();

const { id, title, slug, polygon_data, svgRef, activeGroup, project_image, isContainImage } = storeToRefs(projectStore);

const projectImage = ref<imageInterface[] | null>(null);
const colorsRef = ref();

const setProjectMeta = async (metaArr: { key: string; value: any }[]) => {
  await ajaxAxios.post("", {
    action: "ire_create_or_update_meta",
    nonce: irePlugin.nonce,
    project_id: id.value,
    meta_data: metaArr
  });

  projectStore.getProjectMeta();
};

const containImageCheckbox = () => {
  const imgContainMeta = projectStore.projectMeta?.find((item) => item.meta_key === "project_img_contain");

  if (imgContainMeta) {
    imgContainMeta.meta_value = projectStore.isContainImage ? "false" : "true";
  }
};

const updateProject = async () => {
  setProjectMeta([
    { key: "project_img_contain", value: JSON.parse(isContainImage.value || "false") },
    ...colorsRef.value?.metaColors
  ]);

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

    showToast("success", "Project Updated!");
  } catch (error) {
    showToast("error", "Something went wrong!");
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
          <input type="checkbox" v-model="isContainImage" @change="containImageCheckbox" />
        </div>

        <div>
          <div class="font-semibold">Shortcode:</div>
          <p>[ire_project id=”{{ projectStore?.id }}″]</p>
        </div>
      </div>

      <div class="w-60 rounded-md bg-white p-4">
        <UploadImg v-model="projectImage" title="Upload project image" required />
      </div>

      <div class="w-60 rounded-md bg-white p-4">
        <ColorVariables ref="colorsRef" />
      </div>
    </div>

    <div class="flex flex-col items-end gap-3">
      <div class="flex"></div>
      <Button title="Update" outlined @click="updateProject" />
    </div>
  </div>
</template>
