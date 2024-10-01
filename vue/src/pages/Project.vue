<script setup lang="ts">
import Canvas from "@components/Canvas.vue";
import ProjectBottomWidgets from "@/src/components/UiComponents/common/ProjectBottomWidgets/ProjectBottomWidgets.vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/src/stores/useProject";
import ModalBoxes from "@components/UiComponents/projects/ModalBoxes.vue";
import { onMounted } from "vue";
import { useFloorsStore } from "../stores/useFloors";
import { useTypesStore } from "../stores/useTypes";
import { useFlatsStore } from "../stores/useFlats";
import { useBlocksStore } from "../stores/useBlock";
import Preview from "../components/ShortcodeComponents/preview/Preview.vue";

const projectStore = useProjectStore();
const floorsStore = useFloorsStore();
const blockStore = useBlocksStore();
const typesStore = useTypesStore();
const flatsStore = useFlatsStore();

const { polygon_data, activeGroup, svgRef, svg, id, isContainImage, project_image } = storeToRefs(projectStore);

const deleteG = (key: string) => {
  activeGroup.value = null;
  projectStore.removePoligonItem(key);
  svgRef.value?.querySelector(`#${key}`)?.remove();
};

onMounted(() => {
  const projectId = Number(id.value);

  floorsStore.fetchProjectFloors(projectId);
  blockStore.fetchProjectBLocks(projectId);
  typesStore.fetchProjectTypes(projectId);
  flatsStore.fetchProjectFlats(projectId);
});
</script>

<template>
  <div class="container-fluid">
    <!-- <Preview /> -->

    <Canvas
      :projectImage="project_image?.url || ''"
      :polygon_data="polygon_data"
      :svgRef="svgRef"
      :svg="svg"
      :activeGroup="activeGroup"
      :isFloorsCanvas="false"
      :isImageContain="isContainImage"
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
