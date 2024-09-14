<script setup lang="ts">
// @ts-ignore
import SvgCanvas from "./SvgCanvas.vue";
import { PolygonDataCollection } from "../../types/components";
import Sidebar from "./UiComponents/common/Sidebar.vue";
import LinkPolygon from "./UiComponents/common/LinkPolygon.vue";

defineEmits<{
  (e: "setActiveG", gTag: SVGGElement | null): void;
  (e: "deleteG", key: string): void;
  (e: "setSvgRef", svgContainer: HTMLDivElement): void;
  (e: "addPolygonData", key: string): void;
}>();

defineProps<{
  projectImage: string;
  polygon_data: PolygonDataCollection[] | undefined;
  svgRef: HTMLElement | null;
  svg: string;
  activeGroup: SVGGElement | null;
}>();
</script>

<template>
  <div class="canvas-container relative h-full select-none overflow-hidden bg-gray-50 pt-[50%]">
    <img :src="projectImage" class="absolute left-0 top-0 h-full w-full object-cover" />
    <SvgCanvas
      :svgRef="svgRef"
      :svg="svg"
      :active-group="activeGroup"
      @set-active-g="(gTag: SVGGElement | null) => $emit('setActiveG', gTag)"
      @set-svg-ref="(svgContainer: HTMLDivElement) => $emit('setSvgRef', svgContainer)"
      @add-polygon-data="(key: string) => $emit('addPolygonData', key)"
    />
    <Sidebar
      :active-group="activeGroup"
      :polygon_data="polygon_data"
      :svgRef="svgRef"
      @set-active-g="(gTag) => $emit('setActiveG', gTag)"
      @delete-g="(key) => $emit('deleteG', key)"
    />

    <LinkPolygon />
  </div>
</template>
