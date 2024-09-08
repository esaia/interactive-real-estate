<script setup lang="ts">
// @ts-ignore
import SvgCanvas from "../components/SvgCanvas.vue";
import ProjectBottomWidgets from "../components/UiComponents/common/ProjectBottomWidgets.vue";
import Sidebar from "../components/UiComponents/common/Sidebar.vue";
import { useProjectStore } from "../stores/useProject";

const projectStore = useProjectStore();
</script>

<template>
  <div class="container-fluid">
    <div class="canvas-container relative h-full overflow-hidden bg-gray-50 pt-[50%]">
      <img :src="projectStore.project_image" class="absolute left-0 top-0 h-full w-full object-cover" />
      <SvgCanvas />
      <Sidebar />
    </div>

    <ProjectBottomWidgets />
  </div>
</template>
