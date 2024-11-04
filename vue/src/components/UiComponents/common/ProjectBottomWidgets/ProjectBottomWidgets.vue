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
import { useMetaStore } from "@/src/stores/useMeta";
import Modal from "../../Modal.vue";
import GenerateObject from "./GenerateObject.vue";
const projectStore = useProjectStore();
const metaStore = useMetaStore();

const { id, title, slug, polygon_data, svgRef, activeGroup, project_image } = storeToRefs(projectStore);
const { isContainImage } = storeToRefs(metaStore);

const projectImage = ref<imageInterface[] | null>(null);
const colorsRef = ref();
const showGenerateObject = ref(false);
const showPreview = ref(false);
const projectUpdateToogle = ref(false);

const containImageCheckbox = () => {
  const imgContainMeta = metaStore.getMeta("project_img_contain");

  if (imgContainMeta) {
    imgContainMeta.meta_value = isContainImage.value ? "false" : "true";
  }
};

const updateProject = async () => {
  metaStore.setProjectMeta([
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
      action: "ire_update_project",
      nonce: irePlugin.nonce,
      ...params
    });

    activeGroup.value = null;
    projectUpdateToogle.value = !projectUpdateToogle.value;
    showToast("success", "Project Updated!");
  } catch (error) {
    showToast("error", "Something went wrong!");
  }
};

watch(
  () => showPreview.value,
  () => {
    if (!showPreview.value) {
      projectStore.fetchProjects(projectStore.id);
    }
  }
);

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

defineExpose({
  showPreview,
  projectUpdateToogle
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
          </div>
          <input type="checkbox" v-model="isContainImage" @change="containImageCheckbox" />
        </div>

        <div>
          <div class="font-semibold">Shortcode:</div>
          <p>[ire_project id="{{ projectStore?.id }}"]</p>
        </div>

        <div class="cursor-pointer hover:underline" @click="showGenerateObject = true">
          Generate data for standalone version
        </div>
      </div>

      <div class="w-60 rounded-md bg-white p-4">
        <UploadImg
          v-model="projectImage"
          title="Upload project image"
          :example-image="irePlugin?.plugin_assets_path + 'exampleImages/mainRender.jpg'"
          required
        />
      </div>

      <div class="rounded-md bg-white p-4">
        <ColorVariables ref="colorsRef" />
      </div>
    </div>

    <div class="flex flex-col items-end gap-3">
      <div class="flex items-center gap-4">
        <Button title="preview" outlined @click="showPreview = !showPreview" class="w-fit" />
        <Button title="Update" outlined @click="updateProject" />
      </div>
    </div>
  </div>

  <teleport to="#ire-vue-app">
    <Transition name="fade">
      <Modal v-if="showGenerateObject" type="2" @close="showGenerateObject = false">
        <GenerateObject />
      </Modal>
    </Transition>
  </teleport>
</template>
