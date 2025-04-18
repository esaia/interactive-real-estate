<script setup lang="ts">
import Canvas from "@components/Canvas.vue";
import ProjectBottomWidgets from "@/src/components/UiComponents/common/ProjectBottomWidgets/ProjectBottomWidgets.vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/src/stores/useProject";
import ModalBoxes from "@components/UiComponents/projects/ModalBoxes.vue";
import { onMounted, ref } from "vue";
import { useFloorsStore } from "../stores/useFloors";
import { useTypesStore } from "../stores/useTypes";
import { useFlatsStore } from "../stores/useFlats";
import { useBlocksStore } from "../stores/useBlock";
import { useActionsStore } from "../stores/useActions";
import ShortCode from "../components/ShortcodeComponents/ShortCode.vue";
import Loading from "../components/UiComponents/common/Loading.vue";

const projectStore = useProjectStore();
const floorsStore = useFloorsStore();
const blockStore = useBlocksStore();
const typesStore = useTypesStore();
const flatsStore = useFlatsStore();
const actionsStore = useActionsStore();

const { polygon_data, activeGroup, svgRef, svg, id, project_image } = storeToRefs(projectStore);

const bottomWidgetsRef = ref();
const loading = ref(true);

const deleteG = (key: string) => {
  activeGroup.value = null;
  projectStore.removePoligonItem(key);
  svgRef.value?.querySelector(`#${key}`)?.remove();
};

onMounted(async () => {
  const projectId = Number(id.value);
  loading.value = true;

  await Promise.all([
    floorsStore.fetchProjectFloors(projectId),
    blockStore.fetchProjectBLocks(projectId),
    typesStore.fetchProjectTypes(projectId),
    flatsStore.fetchProjectFlats(projectId),
    actionsStore.fetchProjectActions(projectId)
  ]);

  loading.value = false;
});
</script>

<template>
  <div v-if="loading" class="p-3">
    <Loading />
  </div>

  <div v-else class="container-fluid">
    <ShortCode v-if="bottomWidgetsRef?.showPreview" :project-id="projectStore.id" />

    <Canvas
      v-else
      :projectImage="project_image?.url || ''"
      :polygon_data="polygon_data"
      :svgRef="svgRef"
      :svg="svg"
      :activeGroup="activeGroup"
      :isFloorsCanvas="false"
      @set-svg-ref="(svgContainer: any) => (svgRef = svgContainer)"
      @set-active-g="(gTag: any) => (activeGroup = gTag)"
      @delete-g="(key: any) => deleteG(key)"
      @add-polygon-data="(key: any) => projectStore.addPolygonData(key)"
      @update-polygon-data="(key: any, data: any) => projectStore.editpoligonData(key, data)"
    />

    <ModalBoxes v-if="!bottomWidgetsRef?.showPreview" class="mt-10" />

    <ProjectBottomWidgets ref="bottomWidgetsRef" />
  </div>
</template>
