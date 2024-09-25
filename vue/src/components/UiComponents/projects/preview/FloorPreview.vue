<script setup lang="ts">
import { transformSvgString } from "@/src/composables/helpers";
import { FlatItem, FloorItem } from "@/types/components";
import { computed, onMounted, ref, watch } from "vue";
import Tooltip_1 from "./Tooltip_1.vue";

const emits = defineEmits<{
  (e: "changeComponent", flow: "" | "flat" | "floor" | "block" | "project", hoveredData: any): void;
}>();

const props = defineProps<{
  flats: FlatItem[] | undefined;
  floor: FloorItem;
  cssVariables: any;
}>();

const svgRef = ref();
const hoveredSvg = ref();
const activePolygon = ref();
const activeFlat = ref<FlatItem>();

const floorSvg = computed(() => {
  if (!props.floor?.svg) return;

  return transformSvgString(props.floor.svg);
});

const onSvgMouseOver = (e: any) => {
  const target: HTMLElement | null = e.target;

  if (target) {
    hoveredSvg.value = target;
  }
};

watch(
  () => hoveredSvg.value,
  (ns) => {
    if (!ns) return;

    const activeG = ns.parentElement;

    if (activeG && activeG.nodeName === "g") {
      const id = activeG.getAttribute("id");
      if (!id) return;
      activePolygon.value = props.floor?.polygon_data.find((item) => item.key === id) || null;
      if (!activePolygon.value) return;

      if (activePolygon.value?.type === "flat") {
        const activeFindedflat = props.flats?.find((flat) => flat.id === activePolygon.value?.id);
        activeFlat.value = activeFindedflat;
      }
    } else {
      activePolygon.value = null;
    }
  }
);

onMounted(() => {
  if (svgRef.value) {
    const gTags = svgRef.value.querySelectorAll("g");

    gTags.forEach((g: SVGGElement) => {
      const gId = g.getAttribute("id");

      const findedPolygon = props.floor.polygon_data.find((polygon) => polygon.key === gId);

      if (!props.flats) return;

      if (props.floor.conf) {
        g.setAttribute("conf", props.floor?.conf || "");
      } else {
        const activeFlat = props.flats?.find((flat) => flat.id === findedPolygon?.id);

        g.setAttribute("conf", activeFlat?.conf?.toString() || "");
      }
    });
  }
});
</script>

<template>
  <div class="relative h-full select-none overflow-hidden bg-gray-50 pt-[50%]" :style="cssVariables">
    <div
      class="absolute left-4 top-4 z-20 cursor-pointer bg-white px-5 py-2 transition-all hover:bg-black hover:text-white"
      @click="$emit('changeComponent', 'project', null)"
    >
      Back
    </div>

    <img
      :src="floor.floor_image?.[0]?.url || ''"
      alt=""
      class="absolute left-0 top-0 h-full w-full"
      :class="{
        'object-contain': floor.img_contain,
        'object-cover': !floor.img_contain
      }"
    />

    <div
      ref="svgRef"
      class="absolute left-0 top-0 h-full w-full [&_g[conf=reserved]_path]:fill-[var(--reserved-color)] [&_g[conf=sold]_path]:fill-[var(--sold-color)] [&_path]:cursor-pointer [&_path]:fill-[var(--path-color)] [&_path]:transition-all hover:[&_path]:fill-[var(--path-hover-color)]"
      v-html="floorSvg"
      :key="floorSvg"
      @mouseover="onSvgMouseOver"
    ></div>

    <Tooltip_1 :hovered-data="activeFlat" :type="activePolygon?.type || ''" />
  </div>
</template>
