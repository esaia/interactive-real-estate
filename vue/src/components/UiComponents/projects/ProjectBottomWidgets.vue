<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useProjectStore } from "../../../stores/useProject";
import { useToast } from "vue-toast-notification";
import ajaxAxios from "@/src/utils/axios";
import { useSelectImage } from "@/src/composables/useSelectImage";
import Button from "../form/Button.vue";
import { resetCanvasAfterSave } from "@/src/composables/helpers";
import { useFloorsStore } from "@/src/stores/useFloors";

const $toast = useToast();
const { selectedImage, selectImage } = useSelectImage();
const projectStore = useProjectStore();
const floorsStore = useFloorsStore();

const { projectFloors } = storeToRefs(floorsStore);
const { id, title, slug, polygon_data, svgRef, activeGroup, project_image } = storeToRefs(projectStore);

const updateProject = async () => {
  // const svg = svgRef.value?.querySelector("svg");

  if (svgRef.value) {
    resetCanvasAfterSave(svgRef.value);
  }

  // if (svgRef.value) {
  //   const imgElement = svgRef.value?.parentElement?.querySelector("img");
  //   const svg = svgRef.value.querySelector("svg");

  //   if (imgElement) {
  //     imgElement.style.transform = "scale(1)";
  //   }

  //   if (svg) {
  //     svg.style.transform = "scale(1)";

  //     const g = svgRef.value.querySelectorAll("g");

  //     g.forEach((gtag) => {
  //       if (!gtag.getAttribute("id")) {
  //         gtag.remove();
  //       }
  //     });

  //     const circles = svg.querySelectorAll("circle");
  //     circles.forEach((circle) => {
  //       circle.setAttribute("fill", "#00000000");
  //       circle.setAttribute("r", CIRCLE_RADIUS.toString());
  //     });

  //     const paths = svg.querySelectorAll("path");
  //     paths.forEach((path) => {
  //       path.setAttribute("fill", PATH_COLOR);
  //     });
  //   }
  // }

  const params: any = {
    projectId: id.value,
    title: title.value,
    slug: slug.value,
    svg: svgRef.value?.querySelector("svg")?.outerHTML || "",
    polygon_data: polygon_data.value
  };

  if (selectedImage.value && selectedImage.value.id) {
    params.project_image = selectedImage.value.id;
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

    if (selectedImage.value?.url) {
      project_image.value = selectedImage.value?.url;
    }
  } catch (error) {
    $toast.error("Something went wrong!", {
      position: "top"
    });
  }
};
</script>

<template>
  <div class="my-7 flex items-start justify-between">
    <div class="flex gap-5">
      <div class="flex flex-col items-start gap-5 rounded-md bg-white p-4">
        <div class="flex flex-col gap-2">
          <label for="" class="font-semibold">Project Title:</label>
          <input type="text" v-model="title" />
        </div>

        <div class="flex w-full items-center justify-between gap-2">
          <div>
            <p class="font-semibold">object-fit: contain</p>
            <p class="mb-1 text-xs italic text-gray-500">default is cover</p>
          </div>
          <input type="checkbox" />
        </div>

        <div class="flex w-full items-center justify-between gap-2">
          <div>
            <p class="font-semibold">object-fit: contain</p>
            <p class="mb-1 text-xs italic text-gray-500">default is cover</p>
          </div>
          <input type="checkbox" />
        </div>

        <div>
          <div class="font-semibold">Shortcode:</div>
          <p>[ire_project_{{ projectStore.id }}]</p>
        </div>
      </div>

      <div class="w-60 rounded-md bg-white p-4">
        <p class="mb-1 font-semibold">Change project image</p>
        <img :src="selectedImage?.url || project_image" class="h-32 w-full rounded-md object-cover" />
        <button class="!mt-2 w-full border border-dashed py-2 transition-all hover:bg-gray-50" @click="selectImage">
          Upload
        </button>
      </div>
    </div>

    <div class="flex flex-col items-end gap-3">
      <div class="flex"></div>
      <Button title="Update" @click="updateProject" />
      <!-- <Button title="Back" :href="irePlugin.plugin_url" /> -->
    </div>
  </div>
</template>
