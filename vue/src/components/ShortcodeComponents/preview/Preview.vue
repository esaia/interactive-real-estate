<script setup lang="ts">
import ajaxAxios from "@/src/utils/axios";
import { ActionData, FlatItem, ShortcodeData } from "@/types/components";
import { computed, onMounted, reactive, ref, watch } from "vue";
import ProjectPreview from "./ProjectPreview.vue";
import FloorPreview from "./FloorPreview.vue";
import FlatPreview from "./FlatPreview.vue";
import BlockPreview from "./BlockPreview.vue";
import Modal from "../../UiComponents/Modal.vue";
import ActionModal from "./ActionModal.vue";

const {
  PREVIEW_PATH_COLOR,
  PREVIEW_PATH_HOVER_COLOR,
  PREVIEW_RESERVED_COLOR,
  PREVIEW_SOLD_COLOR,
  PREVIEW_STROKE_COLOR,
  PREVIEW_STROKE_WIDTH
} = constants;

const props = defineProps<{
  projectId: string;
  componentId: string;
}>();

const colors = reactive({
  path: PREVIEW_PATH_COLOR,
  path_hover: PREVIEW_PATH_HOVER_COLOR,
  reserved: PREVIEW_RESERVED_COLOR,
  sold: PREVIEW_SOLD_COLOR,
  stroke_color: PREVIEW_STROKE_COLOR,
  stroke_width: PREVIEW_STROKE_WIDTH
});

const cssVariables = computed(() => {
  return {
    "--reserved-color": colors.reserved,
    "--sold-color": colors.sold,
    "--path-hover-color": colors.path_hover,
    "--path-color": colors.path,
    "--stroke-color": colors.stroke_color,
    "--stroke-width": colors.stroke_width + "px"
  };
});

const shortcodeData = ref<ShortcodeData>();

const flow = ref<"projectFlow" | "floorFlow" | "blockFlow" | "flatFlow">("projectFlow");
const hoveredData = ref();
const showModal = ref(false);

const project = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.project;
});

const floors = computed(() => {
  if (!shortcodeData.value) return;

  shortcodeData.value.floors?.forEach((floor) => {
    const { flats, conf } = floor || {};

    if (flats?.length && !conf) {
      const allReserved = flats.every((flat: FlatItem) => flat.conf === "reserved");
      const allSold = flats.every((flat: FlatItem) => flat.conf === "sold");

      if (allReserved) {
        floor.conf = "reserved";
      } else if (allSold) {
        floor.conf = "sold";
      }
    }
  });

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

const actions = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.actions;
});

const projectMeta = computed(() => {
  if (!shortcodeData.value) return;
  return shortcodeData.value.meta;
});

const getColorMeta = (metaKey: string) => {
  return projectMeta.value?.find((meta) => meta.meta_key === metaKey)?.meta_value;
};

const fetchData = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_shortcode_data",
    nonce: irePlugin.nonce,
    project_id: props?.projectId || 83,
    block: "all"
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
    case "tooltip":
      const actionData: ActionData = polygonItem?.data;
      hoveredData.value = actionData;

      if (actionData.actionType === "url") {
        console.log("runned");
        window.open(actionData.url, actionData.targetBlank ? "_blank" : "_self");
      } else if (actionData.actionType === "modal") {
        showModal.value = true;
      }

      break;

    default:
      break;
  }
};

watch(
  () => projectMeta.value,
  () => {
    const path_color = getColorMeta("path_color");
    const path_hover_color = getColorMeta("path_hover_color");
    const reserved_color = getColorMeta("reserved_color");
    const sold_color = getColorMeta("sold_color");
    const stroke_color = getColorMeta("stroke_color");
    const stroke_width = getColorMeta("stroke_width");

    if (path_color) {
      colors.path = path_color.toString();
    }

    if (path_hover_color) {
      colors.path_hover = path_hover_color.toString();
    }

    if (reserved_color) {
      colors.reserved = reserved_color.toString();
    }

    if (sold_color) {
      colors.sold = sold_color.toString();
    }

    if (stroke_color) {
      colors.stroke_color = stroke_color.toString();
    }

    if (stroke_width) {
      colors.stroke_width = Number(stroke_width);
    }
  }
);

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <Transition name="fade-in-out" mode="out-in" :style="cssVariables" class="stroke">
      <div v-if="shortcodeData" :key="flow">
        <ProjectPreview
          v-if="flow === 'projectFlow'"
          :project="project"
          :floors="floors"
          :flats="flats"
          :projectMeta="projectMeta"
          :blocks="blocks"
          :actions="actions"
          @changeComponent="(x, y) => changeRoute(x, y)"
        />

        <BlockPreview
          v-else-if="flow === 'blockFlow' && flats && floors && blocks"
          :block="hoveredData"
          :flats="flats"
          :floors="floors"
          @changeComponent="(x, y) => changeRoute(x, y)"
        />

        <FloorPreview
          v-else-if="flow === 'floorFlow' && floors"
          :flats="flats"
          :floor="hoveredData"
          :floors="floors"
          :blocks="blocks"
          @changeComponent="(x, y) => changeRoute(x, y)"
        />

        <FlatPreview
          v-else-if="flow === 'flatFlow'"
          :flat="hoveredData"
          :floors="floors"
          @changeComponent="(x, y) => changeRoute(x, y)"
        />
      </div>
    </Transition>

    <teleport :to="'#' + componentId">
      <Transition name="fade-in-out" appear>
        <Modal v-if="showModal" @close="showModal = false">
          <ActionModal :modalData="hoveredData" />
        </Modal>
      </Transition>
    </teleport>
  </div>
</template>

<style scoped>
.stroke :deep(.canvas path) {
  stroke: var(--stroke-color);
  stroke-width: var(--stroke-width);
}
</style>
