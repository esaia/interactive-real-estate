<script setup lang="ts">
import { transformSvgString } from "@/src/composables/helpers";
import {
  BlockItem,
  FlatItem,
  FloorItem,
  PolygonDataCollection,
  ProjectInterface,
  ProjectMeta
} from "@/types/components";
import { computed } from "@vue/reactivity";
import { ref, watch } from "vue";
import Tooltip_1 from "./Tooltip_1.vue";

const emits = defineEmits<{
  (e: "changeComponent", flowComponent: "" | "flat" | "floor" | "block", hoveredData: any): void;
}>();

const props = defineProps<{
  project: ProjectInterface | undefined;
  floors: FloorItem[] | undefined;
  blocks: BlockItem[] | undefined;
  flats: FlatItem[] | undefined;
  projectMeta: ProjectMeta[] | undefined;
}>();

const hoveredSvg = ref<HTMLElement>();
const hoveredData = ref();
const activePolygon = ref<PolygonDataCollection | null>(null);

const projectSvg = computed(() => {
  if (!props.project) return;

  return transformSvgString(props.project.svg);
});

const isContainImage = computed(() => {
  const findMeta = props.projectMeta?.find((item) => item.meta_key === "project_img_contain")?.meta_value;
  return JSON.parse(findMeta?.toString() || "false");
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
  if (hoveredData.value?.conf === "sold" || hoveredData.value?.conf === "reserved") return;

  emits("changeComponent", activePolygon.value?.type || "", hoveredData.value);
};

watch(
  () => hoveredSvg.value,
  (ns) => {
    if (!ns) return;
    const activeG = ns.parentElement;

    if (activeG && activeG.nodeName === "g") {
      const id = activeG.getAttribute("id");
      if (!id) return;

      activePolygon.value = props.project?.polygon_data.find((item) => item.key === id) || null;
      if (!activePolygon.value) return;
      const polygonId = activePolygon.value?.id;
      switch (activePolygon.value?.type) {
        case "floor":
          const activeFloor = props.floors?.find((floor) => floor.id === polygonId);
          hoveredData.value = activeFloor;
          break;
        case "block":
          const activeBlock = props.blocks?.find((block) => block.id === polygonId);
          hoveredData.value = activeBlock;

          break;

        case "flat":
          const activeFlat = props.flats?.find((flat) => flat.id === polygonId);
          hoveredData.value = activeFlat;

          break;
        default:
          break;
      }
    } else {
      activePolygon.value = null;
      hoveredData.value = null;
    }
  }
);

watch(
  () => hoveredData.value,
  () => {
    if (activePolygon.value?.type === "floor") {
      if (
        hoveredData.value?.flats?.length &&
        !hoveredData.value.conf &&
        hoveredData.value?.flats.every((flat: FlatItem) => flat.conf === "reserved")
      ) {
        hoveredData.value.conf = "reserved";
      } else if (
        hoveredData.value?.flats?.length &&
        !hoveredData.value.conf &&
        hoveredData.value?.flats.every((flat: FlatItem) => flat.conf === "sold")
      ) {
        hoveredData.value.conf = "sold";
      }
    }
  }
);
</script>

<template>
  <div class="relative h-full select-none overflow-hidden bg-gray-50 pt-[50%]">
    <img
      :src="project?.project_image[0].url"
      alt=""
      class="absolute left-0 top-0 h-full w-full"
      :class="{ 'object-contain': isContainImage, 'object-cover': !isContainImage }"
    />
    <div
      class="canvas absolute left-0 top-0 h-full w-full [&_path]:cursor-pointer [&_path]:fill-[var(--path-color)] [&_path]:transition-all"
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
