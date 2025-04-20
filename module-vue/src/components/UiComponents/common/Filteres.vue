<script setup lang="ts">
import { useBlocksStore } from "@/src/stores/useBlock";
import { computed } from "vue";
import Select from "../form/Select.vue";
import { selectDataItem } from "@/types/components";
import { useFloorsStore } from "@/src/stores/useFloors";

const selectedBlock = defineModel<any>("block", {
  set: (block: selectDataItem | undefined) => {
    return block?.value;
  },
  get: (blockId: string | undefined) => {
    return blocks.value?.find((block) => block.value === blockId);
  }
});

const selectedFloor = defineModel<any>("floor", {
  set: (floor: selectDataItem | undefined) => {
    return floor?.value;
  },
  get: (floorId: string | undefined) => {
    return floors.value?.find((floor) => floor.value === floorId);
  }
});

defineProps<{
  showOnlyBlocks?: boolean;
}>();

const blocksStore = useBlocksStore();
const floorStore = useFloorsStore();

const blocks = computed(() => {
  const selectBlockData = blocksStore.projectBlocks?.map((block) => {
    return {
      title: block.title,
      value: block.id
    };
  });
  selectBlockData?.unshift({ title: "All", value: "all" });
  return selectBlockData;
});

const floors = computed(() => {
  const floors = new Set(floorStore.projectFloors?.map((floor) => floor?.floor_number));

  return Array.from(floors)
    .sort((a, b) => a - b)
    .map((item) => {
      return {
        title: item.toString(),
        value: item.toString()
      };
    });
});
</script>

<template>
  <div class="flex items-center gap-4">
    <Select
      v-if="blocks && blocks?.length > 1"
      v-model="selectedBlock"
      :data="blocks"
      placeholder="Filter by block"
      clearable
      class="min-w-[150px]"
    />

    <Select
      v-if="!showOnlyBlocks"
      v-model="selectedFloor"
      :data="floors"
      placeholder="Filter by Floors"
      clearable
      class="min-w-[150px]"
    />
  </div>
</template>
