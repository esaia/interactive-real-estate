<script setup lang="ts">
import { useBlocksStore } from "@/src/stores/useBlock";
import { computed, ref, watch } from "vue";
import Select from "../form/Select.vue";
import { selectDataItem } from "@/types/components";

const emits = defineEmits<{
  (e: "filterByBlock", selectedBlock: selectDataItem | null): void;
}>();

const blocksStore = useBlocksStore();
const selectedBlock = ref();

const blocks = computed(() => {
  return blocksStore.projectBlocks?.map((block) => {
    return {
      title: block.title,
      value: block.id
    };
  });
});

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
      v-if="blocks"
      v-model="selectedBlock"
      :data="blocks"
      placeholder="Filter by block"
      clearable
      class="w-[200px]"
    />
  </div>
</template>
