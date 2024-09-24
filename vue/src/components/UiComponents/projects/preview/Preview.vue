<script setup lang="ts">
import ajaxAxios from "@/src/utils/axios";
import { ShortcodeData } from "@/types/components";
import { computed, onMounted, ref } from "vue";
import ProjectPreview from "./ProjectPreview.vue";
import FloorPreview from "./FloorPreview.vue";

const colors = {
  reserved: "#ffff0062",
  sold: "#ff000038",
  path_hover: "#ffffff8b",
  path: "#ffffff4b"
};

const cssVariables = {
  "--reserved-color": colors.reserved,
  "--sold-color": colors.sold,
  "--path-hover-color": colors.path_hover,
  "--path-color": colors.path
};

const shortcodeData = ref<ShortcodeData>();

const flow = ref<"projectFlow" | "floorFlow" | "flatFlow">("projectFlow");
const hoveredData = ref();

const project = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.project;
});

const floors = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.floors;
});

const flats = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.flats;
});

const projectMeta = computed(() => {
  if (!shortcodeData.value) return;
  return shortcodeData.value.meta;
});

const fetchData = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_shortcode_data",
    nonce: irePlugin.nonce,
    project_id: 83
  });

  if (data.success) {
    shortcodeData.value = data.data;
  }
};

const changeRoute = (flowType: string, polygonItem: any) => {
  switch (flowType) {
    case "project":
      flow.value = "projectFlow";
      break;

    case "floor":
      flow.value = "floorFlow";
      hoveredData.value = polygonItem;
      break;

    default:
      break;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <Transition name="fade-in-out" mode="out-in">
      <div v-if="shortcodeData" :key="flow">
        <ProjectPreview
          v-if="flow === 'projectFlow'"
          :project="project"
          :floors="floors"
          :projectMeta="projectMeta"
          :cssVariables="cssVariables"
          @changeComponent="(x, y) => changeRoute(x, y)"
        />

        <FloorPreview
          v-else-if="flow === 'floorFlow'"
          :flats="flats"
          :floor="hoveredData"
          :cssVariables="cssVariables"
          @changeComponent="(x, y) => changeRoute(x, y)"
        />
      </div>
    </Transition>
  </div>
</template>
