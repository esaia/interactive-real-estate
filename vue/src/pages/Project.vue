<script setup lang="ts">
import Canvas from "@components/Canvas.vue";
import ProjectBottomWidgets from "@components/UiComponents/projects/ProjectBottomWidgets.vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/src/stores/useProject";
import ModalBoxes from "@components/UiComponents/projects/ModalBoxes.vue";

const projectStore = useProjectStore();
const { polygon_data, activeGroup, svgRef, svg } = storeToRefs(projectStore);

const deleteG = (key: string) => {
  activeGroup.value = null;
  projectStore.removePoligonItem(key);
  svgRef.value?.querySelector(`#${key}`)?.remove();
};
</script>

<template>
  <div class="container-fluid">
    <Canvas
      :projectImage="projectStore.project_image"
      :polygon_data="polygon_data"
      :svgRef="svgRef"
      :svg="svg"
      :activeGroup="activeGroup"
      :isFloorsCanvas="false"
      @set-svg-ref="(svgContainer) => (svgRef = svgContainer)"
      @set-active-g="(gTag) => (activeGroup = gTag)"
      @delete-g="(key) => deleteG(key)"
      @add-polygon-data="(key) => projectStore.addPolygonData(key)"
      @update-polygon-data="(key, data) => projectStore.editpoligonData(key, data)"
    />

    <ProjectBottomWidgets />

    <ModalBoxes />
  </div>
</template>
