<script setup lang="ts">
import { ref } from "vue";
import { imageInterface } from "../../../../types/components";
import UploadImg from "../form/UploadImg.vue";
import Canvas from "../../Canvas.vue";
import { useProjectStore } from "../../../stores/useProject";
import { storeToRefs } from "pinia";

const selectedImage = ref<imageInterface>();

const projectStore = useProjectStore();
const { polygon_data, activeGroup, svgRef } = storeToRefs(projectStore);

const deleteG = (key: string) => {
  activeGroup.value = null;
  projectStore.removePoligonItem(key);
  svgRef.value?.querySelector(`#${key}`)?.remove();
};
</script>

<template>
  <div class="flex gap-5">
    <div class="flex-1">
      Floor Canvas

      <Canvas
        :projectImage="projectStore.project_image"
        :polygon_data="polygon_data"
        :svgRef="svgRef"
        :activeGroup="activeGroup"
        @set-svg-ref="(svgContainer) => (svgRef = svgContainer)"
        @set-active-g="(gTag) => (activeGroup = gTag)"
        @delete-g="(key) => deleteG(key)"
        @add-polygon-data="(key) => projectStore.addPoligonData(key)"
      />
    </div>
    <div class="mt-8 flex w-80 flex-col items-center gap-3">
      <h2 class="text-lg">Add Floor</h2>
      <input type="text" class="w-full" placeholder="Floor title" />
      <input type="number" class="w-full" placeholder="Floor number" />

      <select name="cars" id="cars" class="w-full !max-w-full">
        <option value="">conf</option>
        <option value="Reserved">Reserved</option>
        <option value="Sold">Sold</option>
      </select>

      <UploadImg v-model="selectedImage" />

      <button class="button w-full">Add Floor</button>
    </div>
  </div>
</template>
