<script setup lang="ts">
// @ts-ignore
import SvgCanvas from "../components/SvgCanvas.vue";
import Canvas from "../components/Canvas.vue";
import ProjectBottomWidgets from "../components/UiComponents/projects/ProjectBottomWidgets.vue";
// import Sidebar from "../components/UiComponents/common/Sidebar.vue";
import { useProjectStore } from "../stores/useProject";
import { storeToRefs } from "pinia";
import FloorsList from "../components/UiComponents/floors/FloorsList.vue";

const projectStore = useProjectStore();
const { polygon_data, activeGroup, svgRef } = storeToRefs(projectStore);

const deleteG = (key: string) => {
  activeGroup.value = null;
  projectStore.removePoligonItem(key);
  svgRef.value?.querySelector(`#${key}`)?.remove();
};
</script>

<template>
  <div class="container-fluid">
    <!-- <div class="canvas-container relative h-full overflow-hidden bg-gray-50 pt-[50%]">
      <img :src="projectStore.project_image" class="absolute left-0 top-0 h-full w-full object-cover" />
      <SvgCanvas />
      <Sidebar />
    </div> -->

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

    <ProjectBottomWidgets />
    <FloorsList />
  </div>
</template>
