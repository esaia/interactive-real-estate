<script setup lang="ts">
import { transformSvgString } from "@/src/composables/helpers";
import { BlockItem, FlatItem, FloorItem } from "@/types/components";
import { computed, onMounted, ref, watch } from "vue";
import BackButton from "@/src/components/ShortcodeComponents/BackButton.vue";
import Select from "../../UiComponents/form/Select.vue";
import PreviewLayout from "../layout/PreviewLayout.vue";

const emits = defineEmits<{
  (e: "changeComponent", flow: "" | "flat" | "floor" | "block" | "project", hoveredData: any): void;
}>();

const props = defineProps<{
  flats: FlatItem[] | undefined;
  floor: FloorItem;
  floors: FloorItem[];
  blocks?: BlockItem[];
}>();

const svgRef = ref();
const hoveredSvg = ref();
const activePolygon = ref();
const activeFlat = ref<FlatItem>();
const selectedFloor = ref();
const floorBlock = ref<BlockItem>();

const floorSvg = computed(() => {
  if (!props.floor?.svg) return;

  return transformSvgString(props.floor.svg);
});

const floorsSelect = computed(() => {
  return (
    props.floors
      .filter(
        (floorItem) =>
          floorItem.conf !== "reserved" &&
          floorItem.conf !== "sold" &&
          (props.floor.block_id ? floorItem.block_id === props.floor.block_id : !floorItem.block_id)
      )
      .map((floor) => {
        return {
          title: floor?.floor_number?.toString(),
          value: floor.id
        };
      })
      .sort((a, b) => +a.title - +b.title) || []
  );
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
  if (activeFlat.value?.conf === "sold" || activeFlat.value?.conf === "reserved") return;

  emits("changeComponent", activePolygon.value?.type || "", activeFlat.value);
};

const setPathAttributes = () => {
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
};

const goBack = () => {
  if (props.floor.block_id) {
    emits("changeComponent", "block", floorBlock.value);
  } else {
    emits("changeComponent", "project", null);
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
        const activeFindedflat = props.flats?.find((flat) => flat?.id === activePolygon.value?.id);
        activeFlat.value = activeFindedflat;
      }
    } else {
      activePolygon.value = null;
    }
  }
);

watch(
  () => selectedFloor.value,
  () => {
    const chosenFloor = props.floors.find((floor) => floor.id === selectedFloor.value?.value);

    emits("changeComponent", "floor", chosenFloor);

    setTimeout(() => {
      setPathAttributes();
    }, 0);
  }
);

onMounted(() => {
  floorBlock.value = props.blocks?.find((block) => block.id === props.floor.block_id?.toString());

  selectedFloor.value = floorsSelect.value.find((floorSelect) => floorSelect?.value == props.floor?.id);

  setPathAttributes();
});
</script>

<template>
  <PreviewLayout :hoverdData="activeFlat" :type="activePolygon?.type">
    <template #header>
      <BackButton @click="goBack" />

      <span v-if="floorBlock">
        {{ floorBlock?.title }}
      </span>
      <div class="w-fit bg-white">
        <Select v-model="selectedFloor" :data="floorsSelect" placeholderPrefix="Floor " :isSearchable="false" />
      </div>
    </template>

    <div class="relative h-full select-none overflow-hidden bg-gray-50 pt-[50%]">
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
        class="canvas absolute left-0 top-0 h-full w-full [&_g[conf=reserved]_path]:fill-[var(--reserved-color)] [&_g[conf=sold]_path]:fill-[var(--sold-color)] [&_path]:cursor-pointer [&_path]:fill-[var(--path-color)] [&_path]:transition-all hover:[&_path]:fill-[var(--path-hover-color)]"
        v-html="floorSvg"
        :key="floorSvg"
        @mouseover="onSvgMouseOver"
        @click="onPathClick"
      ></div>
    </div>
  </PreviewLayout>
</template>
