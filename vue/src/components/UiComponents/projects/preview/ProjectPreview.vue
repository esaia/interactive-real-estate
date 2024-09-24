<script setup lang="ts">
import { transformSvgString } from "@/src/composables/helpers";
import { FlatItem, PolygonDataCollection, ShortcodeData } from "@/types/components";
import { computed } from "@vue/reactivity";
import { ref, watch } from "vue";
import Tooltip_1 from "./Tooltip_1.vue";
import { useProjectStore } from "@/src/stores/useProject";

const colors = {
  reserved: "#ffff0062",
  sold: "#ff000038",
  path_hover: "#ffffff8b",
  path: "#ffffff2b"
};

const cssVariables = {
  "--reserved-color": colors.reserved,
  "--sold-color": colors.sold,
  "--path-hover-color": colors.path_hover,
  "--path-color": colors.path
};

const emits = defineEmits<{
  (e: "changeComponent", polygonData: PolygonDataCollection | null, hoveredData: any): void;
}>();

const props = defineProps<{
  shortcodeData: ShortcodeData;
}>();

const projectStore = useProjectStore();

const hoveredSvg = ref<HTMLElement>();
const hoveredData = ref();
const activePolygon = ref<PolygonDataCollection | null>(null);

const project = computed(() => {
  if (!props.shortcodeData) return;

  return props.shortcodeData.project;
});

const floors = computed(() => {
  if (!props.shortcodeData) return;

  return props.shortcodeData.floors;
});

const projectSvg = computed(() => {
  if (!project.value) return;

  return transformSvgString(project.value.svg);
});

const onSvgMouseOver = (e: any) => {
  const target: HTMLElement | null = e.target;

  if (target) {
    hoveredSvg.value = target;
  }
};

const onPathClick = (e: any) => {
  const target: SVGPathElement = e.target;
  if (target.nodeName !== "path") return;

  console.log(activePolygon.value);
  console.log(hoveredData.value);

  emits("changeComponent", activePolygon.value, hoveredData.value);
};

watch(
  () => hoveredSvg.value,
  (ns) => {
    if (!ns) return;

    const activeG = ns.parentElement;

    if (activeG && activeG.nodeName === "g") {
      const id = activeG.getAttribute("id");
      if (!id) return;
      activePolygon.value = project.value?.polygon_data.find((item) => item.key === id) || null;
      if (!activePolygon.value) return;

      switch (activePolygon.value?.type) {
        case "floor":
          const activeFloor = floors.value?.find((floor) => floor.id === activePolygon.value?.id);
          hoveredData.value = activeFloor;
          break;

        default:
          break;
      }
    } else {
      activePolygon.value = null;
    }
  }
);

watch(
  () => hoveredData.value,
  () => {
    if (activePolygon.value?.type === "floor") {
      if (
        hoveredData.value.flats?.length &&
        hoveredData.value.flats.every((flat: FlatItem) => flat.conf === "reserved")
      ) {
        hoveredData.value.conf = "reserved";
      } else if (
        hoveredData.value.flats?.length &&
        hoveredData.value.flats.every((flat: FlatItem) => flat.conf === "sold")
      ) {
        hoveredData.value.conf = "sold";
      }
    }
  }
);
</script>

<template>
  <div class="relative h-full select-none overflow-hidden bg-gray-50 pt-[50%]" :style="cssVariables">
    <img :src="shortcodeData?.project.project_image" alt="" class="absolute left-0 top-0 h-full w-full object-cover" />
    <div
      class="absolute left-0 top-0 h-full w-full [&_path]:cursor-pointer [&_path]:fill-[var(--path-color)] [&_path]:transition-all"
      :class="[
        {
          'hover:[&_path]:fill-[var(--reserved-color)]': hoveredData?.conf === 'reserved',
          'hover:[&_path]:fill-[var(--sold-color)]': hoveredData?.conf === 'sold',
          'hover:[&_path]:fill-[var(--path-hover-color)]': !hoveredData?.conf
        }
      ]"
      v-html="projectSvg"
      :key="projectSvg"
      @mouseover="onSvgMouseOver"
      @click="onPathClick"
    ></div>

    <Tooltip_1 :hoveredData="hoveredData" :type="activePolygon?.type || ''" />
  </div>
</template>
