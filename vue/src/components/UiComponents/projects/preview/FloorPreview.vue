<script setup lang="ts">
import { transformSvgString } from "@/src/composables/helpers";
import { FlatItem, FloorItem, ShortcodeData } from "@/types/components";
import { computed, ref, watch } from "vue";
import Tooltip_1 from "./Tooltip_1.vue";

const props = defineProps<{
  shortcodeData: ShortcodeData;
  flats: FlatItem[] | undefined;
  floor: FloorItem;
  cssVariables: any;
}>();

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
</script>

<template>
  <div class="relative h-full select-none overflow-hidden bg-gray-50 pt-[50%]" :style="cssVariables">
    <img :src="floor.floor_image?.[0]?.url || ''" alt="" class="absolute left-0 top-0 h-full w-full object-cover" />

    <div
      class="absolute left-0 top-0 h-full w-full [&_path]:cursor-pointer [&_path]:fill-[var(--path-color)] [&_path]:transition-all"
      :class="[
        {
          'hover:[&_path]:fill-[var(--reserved-color)]': activeFlat?.conf === 'reserved',
          'hover:[&_path]:fill-[var(--sold-color)]': activeFlat?.conf === 'sold',
          'hover:[&_path]:fill-[var(--path-hover-color)]': !activeFlat?.conf
        }
      ]"
      v-html="floorSvg"
      :key="floorSvg"
      @mouseover="onSvgMouseOver"
    ></div>

    <Tooltip_1 :hovered-data="activeFlat" :type="activePolygon?.type || ''" />
  </div>
</template>
