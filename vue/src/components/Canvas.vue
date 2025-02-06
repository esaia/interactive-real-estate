<script setup lang="ts">
// @ts-ignore
import SvgCanvas from "./SvgCanvas.vue";
import { PolygonDataCollection } from "../../types/components";
import Sidebar from "./UiComponents/common/Sidebar.vue";
import LinkPolygon from "./UiComponents/common/LinkPolygon/LinkPolygon.vue";
import { ref } from "vue";

defineEmits<{
  (e: "setActiveG", gTag: SVGGElement | null): void;
  (e: "deleteG", key: string): void;
  (e: "setSvgRef", svgContainer: HTMLDivElement): void;
  (e: "addPolygonData", key: string): void;
  (e: "updatePolygonData", key: string, updatedData: PolygonDataCollection): void;
}>();

defineProps<{
  projectImage: string;
  polygon_data: PolygonDataCollection[] | undefined;
  svgRef: HTMLElement | null;
  svg: string;
  activeGroup: SVGGElement | null;
  isFloorsCanvas: boolean;
  isBlockCanvas?: boolean;
}>();

const canvasRef = ref();
</script>

<template>
  <div class="relative overflow-x-hidden">
    <Sidebar
      v-if="polygon_data?.length"
      :active-group="activeGroup"
      :polygon_data="polygon_data"
      :svgRef="svgRef"
      @set-active-g="(gTag: any) => $emit('setActiveG', gTag)"
      @delete-g="(key: any) => $emit('deleteG', key)"
      @update-polygon-data="(key: any, data: any) => $emit('updatePolygonData', key, data)"
    />

    <Transition name="fade-in-out">
      <LinkPolygon
        v-if="activeGroup && canvasRef.zoomLevel === 1"
        :key="(activeGroup && activeGroup.getAttribute('id')) || ''"
        :activeGroup="activeGroup"
        :polygon_data="polygon_data"
        :isFloorsCanvas="isFloorsCanvas"
        :isBlockCanvas="isBlockCanvas"
      />

      <div
        v-else-if="canvasRef?.zoomLevel > 1"
        class="pointer-events-none absolute right-0 top-0 z-[99] flex items-center gap-4 bg-white/70 px-2 py-1 text-sm"
      >
        <div class="flex items-center gap-1">
          <span class="shortcode">ctrl</span>
          <span>+</span>
          <span class="shortcode">-</span>
          <p class="!text-sm">Reset zoom</p>
        </div>

        <span>|</span>

        <div class="flex items-center gap-1">
          <span class="shortcode">space</span>
          <span>+</span>
          <span class="shortcode">mouse move</span>
          <p class="!text-sm">Panning</p>
        </div>
      </div>
    </Transition>

    <div class="max-h-[80vh] overflow-x-hidden">
      <div class="canvas-container relative h-full w-full select-none bg-gray-50">
        <img :src="projectImage" class="left-0 top-0 h-full w-full" />
        <SvgCanvas
          ref="canvasRef"
          :svgRef="svgRef"
          :svg="svg"
          :active-group="activeGroup"
          @set-active-g="(gTag: SVGGElement | null) => $emit('setActiveG', gTag)"
          @set-svg-ref="(svgContainer: HTMLDivElement) => $emit('setSvgRef', svgContainer)"
          @add-polygon-data="(key: string) => $emit('addPolygonData', key)"
        />
      </div>
    </div>
  </div>
</template>

<style>
.shortcode {
  @apply rounded-lg bg-gray-600 px-2 py-1 text-sm text-white;
}
</style>
