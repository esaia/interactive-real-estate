<script setup lang="ts">
import { BlockItem, FlatItem, FloorItem } from "@/types/components";
import BackButton from "../BackButton.vue";
import { computed, onMounted, ref, watch } from "vue";
import { transformSvgString } from "@/src/composables/helpers";
import Tooltip_1 from "./Tooltip_1.vue";

const emits = defineEmits<{
  (e: "changeComponent", flow: "" | "flat" | "floor" | "block" | "project", hoveredData: any): void;
}>();

const props = defineProps<{
  block: BlockItem;
  flats: FlatItem[];
  floors: FloorItem[];
}>();

const svgRef = ref();
const hoveredSvg = ref();
const activePolygon = ref();
const activeFlatOrFloor = ref();

const blockSvg = computed(() => {
  if (!props.block?.svg) return;

  return transformSvgString(props.block?.svg);
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
  if (activeFlatOrFloor.value?.conf === "sold" || activeFlatOrFloor.value?.conf === "reserved") return;

  emits("changeComponent", activePolygon.value?.type || "", activeFlatOrFloor.value);
};

watch(
  () => hoveredSvg.value,
  (ns) => {
    if (!ns) return;

    const activeG = ns.parentElement;

    if (activeG && activeG.nodeName === "g") {
      const id = activeG.getAttribute("id");
      if (!id) return;

      activePolygon.value = props.block?.polygon_data.find((item) => item.key === id) || null;
      if (!activePolygon.value) return;

      if (activePolygon.value?.type === "floor") {
        const activeFindedfloor = props.floors?.find((floor) => floor?.id === activePolygon.value?.id);
        activeFlatOrFloor.value = activeFindedfloor;
      } else if (activePolygon.value?.type === "flat") {
        const activeFindedflat = props.flats?.find((flat) => flat?.id === activePolygon.value?.id);
        activeFlatOrFloor.value = activeFindedflat;
      } else {
        activeFlatOrFloor.value = null;
      }
    } else {
      activePolygon.value = null;
      activeFlatOrFloor.value = null;
    }
  }
);
watch(
  () => activeFlatOrFloor.value,
  () => {
    const { type } = activePolygon.value || {};
    const { flats, conf } = activeFlatOrFloor.value || {};

    if (type === "floor" && flats?.length && !conf) {
      const allReserved = flats.every((flat: FlatItem) => flat.conf === "reserved");
      const allSold = flats.every((flat: FlatItem) => flat.conf === "sold");

      if (allReserved) {
        activeFlatOrFloor.value.conf = "reserved";
      } else if (allSold) {
        activeFlatOrFloor.value.conf = "sold";
      }
    }
  }
);
</script>

<template>
  <div>
    <div class="mb-3 flex items-center justify-between">
      <BackButton @click="$emit('changeComponent', 'project', null)" />

      <p>{{ block?.title }}</p>
    </div>

    <div class="relative h-full select-none overflow-hidden bg-gray-50 pt-[50%]">
      <img
        :src="block?.block_image?.[0]?.url || ''"
        alt=""
        class="absolute left-0 top-0 h-full w-full"
        :class="{
          'object-contain': block.img_contain,
          'object-cover': !block.img_contain
        }"
      />

      <div
        ref="svgRef"
        class="canvas absolute left-0 top-0 h-full w-full [&_path]:cursor-pointer [&_path]:fill-[var(--path-color)] [&_path]:transition-all"
        :class="[
          {
            'hover:[&_path]:fill-[var(--reserved-color)]': activeFlatOrFloor?.conf === 'reserved',
            'hover:[&_path]:fill-[var(--sold-color)]': activeFlatOrFloor?.conf === 'sold',
            'hover:[&_path]:fill-[var(--path-hover-color)]': !activeFlatOrFloor?.conf
          }
        ]"
        v-html="blockSvg"
        :key="blockSvg"
        @mouseover="onSvgMouseOver"
        @click="onPathClick"
      ></div>

      <Tooltip_1 :hovered-data="activeFlatOrFloor" :type="activePolygon?.type || ''" />
    </div>
  </div>
</template>
