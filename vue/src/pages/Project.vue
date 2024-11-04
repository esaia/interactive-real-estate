<script setup lang="ts">
import Canvas from "@components/Canvas.vue";
import ProjectBottomWidgets from "@/src/components/UiComponents/common/ProjectBottomWidgets/ProjectBottomWidgets.vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/src/stores/useProject";
import ModalBoxes from "@components/UiComponents/projects/ModalBoxes.vue";
import { onMounted, ref, watch } from "vue";
import { useFloorsStore } from "../stores/useFloors";
import { useTypesStore } from "../stores/useTypes";
import { useFlatsStore } from "../stores/useFlats";
import { useBlocksStore } from "../stores/useBlock";
import { useMetaStore } from "../stores/useMeta";
import { useActionsStore } from "../stores/useActions";
import ShortCode from "../components/ShortcodeComponents/ShortCode.vue";

const projectStore = useProjectStore();
const metaStore = useMetaStore();
const floorsStore = useFloorsStore();
const blockStore = useBlocksStore();
const typesStore = useTypesStore();
const flatsStore = useFlatsStore();
const actionsStore = useActionsStore();

const { polygon_data, activeGroup, svgRef, svg, id, project_image } = storeToRefs(projectStore);

const bottomWidgetsRef = ref();

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
  actionsStore.fetchProjectActions(projectId);
});
</script>

<template>
  <div class="container-fluid">
    <ShortCode v-if="bottomWidgetsRef?.showPreview" :project-id="projectStore.id" />

    <div v-else>
      <Canvas
        :projectImage="project_image?.url || ''"
        :polygon_data="polygon_data"
        :svgRef="svgRef"
        :svg="svg"
        :activeGroup="activeGroup"
        :isFloorsCanvas="false"
        :isImageContain="metaStore?.isContainImage"
        @set-svg-ref="(svgContainer) => (svgRef = svgContainer)"
        @set-active-g="(gTag) => (activeGroup = gTag)"
        @delete-g="(key) => deleteG(key)"
        @add-polygon-data="(key) => projectStore.addPolygonData(key)"
        @update-polygon-data="(key, data) => projectStore.editpoligonData(key, data)"
      />
    </div>

    <!-- <div>
      <Button title="preview" outlined @click="showPreview = !showPreview" class="w-fit" />
    </div> -->

    <ProjectBottomWidgets ref="bottomWidgetsRef" />

    <ModalBoxes />
  </div>
</template>
