<script setup lang="ts">
import { useBlocksStore } from "@/src/stores/useBlock";
import { computed, ref, watch } from "vue";
import Select from "../form/Select.vue";
import { selectDataItem } from "@/types/components";
import { useFloorsStore } from "@/src/stores/useFloors";

const emits = defineEmits<{
  (e: "filterByBlock", selectedBlock: selectDataItem | null): void;
  (e: "filterByFloor", selectedFloor: selectDataItem | null): void;
}>();

const blocksStore = useBlocksStore();
const floorStore = useFloorsStore();
const selectedBlock = ref();
const selectedFloor = ref();

const blocks = computed(() => {
  return blocksStore.projectBlocks?.map((block) => {
    return {
      title: block.title,
      value: block.id
    };
  });
});

const floors = computed(() => {
  const floors = new Set(floorStore.projectFloors?.map((floor) => floor?.floor_number));

  return Array.from(floors).map((item) => {
    return {
      title: item.toString(),
      value: item.toString()
    };
  });
});

watch(
  () => selectedFloor.value,
  (ns) => {
    emits("filterByFloor", ns);
  }
);

watch(
  () => selectedBlock.value,
  (ns) => {
    emits("filterByBlock", ns);
  }
);
</script>

<template>
  <div class="flex items-center gap-4">
    <Select
      v-if="floors"
      v-model="selectedFloor"
      :data="floors"
      placeholder="Filter by Floors"
      clearable
      class="w-[200px]"
    />
    <Select
      v-if="blocks"
      v-model="selectedBlock"
      :data="blocks"
      placeholder="Filter by block"
      clearable
      class="w-[200px]"
    />
  </div>
</template>
