<script setup lang="ts">
import ajaxAxios from "@/src/utils/axios";
import { ShortcodeData } from "@/types/components";
import { computed, onMounted, ref } from "vue";
import ProjectPreview from "./ProjectPreview.vue";
import FloorPreview from "./FloorPreview.vue";
import FlatPreview from "./FlatPreview.vue";
import BlockPreview from "./BlockPreview.vue";

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

const flow = ref<"projectFlow" | "floorFlow" | "blockFlow" | "flatFlow">("projectFlow");
const hoveredData = ref();

const project = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.project;
});

const floors = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.floors;
});

const blocks = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.blocks;
});

const types = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.types;
});

const flats = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value?.flats.map((flat) => {
    const flatType = types.value?.find((type) => type.id === flat.type_id);
    if (flatType) {
      flat.type = flatType;
    }

    return flat;
  });
});

const projectMeta = computed(() => {
  if (!shortcodeData.value) return;
  return shortcodeData.value.meta;
});

const fetchData = async () => {
  const projectId = document.getElementById("ire-shortcode")?.getAttribute("data-project-id");

  const { data } = await ajaxAxios.post("", {
    action: "get_shortcode_data",
    nonce: irePlugin.nonce,
    project_id: projectId || 83 //temporarily
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

    case "block":
      flow.value = "blockFlow";
      hoveredData.value = polygonItem;
      break;

    case "flat":
      flow.value = "flatFlow";
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
      <!-- <FloorPreview
        v-if="floors"
        :flats="flats"
        :floor="floors[0]"
        :floors="floors"
        :cssVariables="cssVariables"
        @changeComponent="(x, y) => changeRoute(x, y)"
      />  -->

      <div v-if="shortcodeData" :key="flow">
        <ProjectPreview
          v-if="flow === 'projectFlow'"
          :project="project"
          :floors="floors"
          :flats="flats"
          :projectMeta="projectMeta"
          :blocks="blocks"
          :cssVariables="cssVariables"
          @changeComponent="(x, y) => changeRoute(x, y)"
        />

        <FloorPreview
          v-else-if="flow === 'floorFlow' && floors"
          :flats="flats"
          :floor="hoveredData"
          :floors="floors"
          :cssVariables="cssVariables"
          @changeComponent="(x, y) => changeRoute(x, y)"
        />

        <BlockPreview v-else-if="flow === 'blockFlow' && floors" @changeComponent="(x, y) => changeRoute(x, y)" />

        <FlatPreview
          v-else-if="flow === 'flatFlow'"
          :flat="hoveredData"
          :floors="floors"
          @changeComponent="(x, y) => changeRoute(x, y)"
        />
      </div>
    </Transition>
  </div>
</template>
