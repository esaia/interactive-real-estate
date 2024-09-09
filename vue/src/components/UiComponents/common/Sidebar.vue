<script setup lang="ts">
import { ref } from "vue";
import Collapse from "../icons/Collapse.vue";
import Edit from "../icons/Edit.vue";
import { PolygonDataCollection } from "../../../../types/components";
const isClollapsed = ref(false);

const emit = defineEmits<{
  (e: "setActiveG", gTag: SVGGElement): void;
  (e: "deleteG", key: string): void;
}>();

const props = defineProps<{
  polygon_data: PolygonDataCollection[] | undefined;
  activeGroup: SVGGElement | null;
  svgRef: HTMLElement | null;
}>();

const setActiveG = (item: PolygonDataCollection) => {
  const gTag = (props.svgRef?.querySelector(`g#${item.key}`) as SVGGElement) || null;

  if (gTag) {
    emit("setActiveG", gTag);
  }
};

const deleteG = (item: PolygonDataCollection) => {
  emit("deleteG", item.key);
};
</script>

<template>
  <div
    class="absolute left-0 top-0 rotate-180 cursor-pointer bg-white/80 transition-all duration-150 ease-out"
    :class="{
      '-translate-x-full': !isClollapsed,
      'translate-x-0 delay-300': isClollapsed
    }"
    @click="isClollapsed = false"
  >
    <div class="icon-hover p-3">
      <Collapse />
    </div>
  </div>

  <div
    class="absolute left-0 top-0 flex h-full flex-col bg-white/70 transition-all duration-300 ease-out"
    :class="{
      '-translate-x-full': isClollapsed,
      'translate-x-0': !isClollapsed
    }"
  >
    <div class="flex items-center justify-between border-b p-3">
      <h3 class="text-lg">Shapes:</h3>

      <div class="cursor-pointer" @click="isClollapsed = true">
        <Collapse />
      </div>
    </div>

    <div class="max-h-full overflow-scroll">
      <div
        v-if="polygon_data"
        v-for="item in Object.values(polygon_data)"
        :key="item.key"
        class="group flex w-full min-w-60 cursor-pointer items-center justify-between px-3 py-3 transition-colors hover:bg-gray-200/80"
        :class="{
          'bg-gray-200/80': item.key === activeGroup?.getAttribute('id')
        }"
        @click="setActiveG(item)"
      >
        <p>shape #{{ item.key.slice(0, 6) }}</p>

        <div class="flex">
          <div
            v-for="i in 3"
            class="border-gray-10 last::bg-green-300 icon-hover-text h-fit cursor-pointer border border-r-0 p-1 transition-all first:rounded-l-sm last-of-type:rounded-r-sm last-of-type:border-r group-hover:border-gray-300"
            :class="{
              'border-gray-300': item.key === activeGroup?.getAttribute('id')
            }"
            @click.stop="deleteG(item)"
          >
            <Edit class="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
