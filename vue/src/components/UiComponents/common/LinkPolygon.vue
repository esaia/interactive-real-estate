<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import Select from "../form/Select.vue";
import { useFloorsStore } from "@/src/stores/useFloors";
import { storeToRefs } from "pinia";
import Close from "../icons/Close.vue";
import { useProjectStore } from "@/src/stores/useProject";
import { PolygonDataCollection, selectDataItem } from "@/types/components";
import { useFlatsStore } from "@/src/stores/useFlats";
import { useBlocksStore } from "@/src/stores/useBlock";
import { getBlockTitleById } from "@/src/composables/helpers";

const props = defineProps<{
  activeGroup: SVGGElement | null;
  polygon_data: PolygonDataCollection[] | undefined;
  isFloorsCanvas: boolean;
  isBlockCanvas?: boolean;
}>();

const key = props.activeGroup?.getAttribute("id");

const activeTab = ref<"block" | "flat" | "floor" | "">("");
const selectedItem = ref<selectDataItem>({ title: "choose", value: "", isLinked: false, type: "" });
const showModal = ref(true);

const projectsStore = useProjectStore();
const floorsStore = useFloorsStore();
const blockStore = useBlocksStore();
const flatsStore = useFlatsStore();
const { projectFloors, activeFloor } = storeToRefs(floorsStore);
const { projectBlocks, activeBlock } = storeToRefs(blockStore);
const { projectFlats } = storeToRefs(flatsStore);

const floorsSelectData = computed<selectDataItem[]>(() => {
  if (!projectFloors.value) return [];

  return projectFloors.value
    .filter((floor) => {
      if (activeBlock.value) {
        return activeBlock.value.id?.toString() === floor.block_id?.toString();
      } else {
        return !floor.block_id;
      }
    })
    ?.map((item) => {
      const isLinked = props.polygon_data?.some((polygon) => polygon.id == item.id && polygon.type === "floor");

      return {
        title: `id: ${item.id} | floor #${item.floor_number.toString()} ${item.conf ? " | " + item.conf : ""}`,
        value: item.id.toString(),
        isLinked,
        type: "floor"
      };
    });
});

const blocksSelectData = computed<selectDataItem[]>(() => {
  if (!projectBlocks.value) return [];

  return projectBlocks.value?.map((item) => {
    const isLinked = props.polygon_data?.some((polygon) => polygon.id == item.id && polygon.type === "block");

    return {
      title: `id: ${item.id} | block: #${item.title} ${item.conf ? " | " + item.conf : ""}`,
      value: item.id.toString(),
      isLinked,
      type: "block"
    };
  });
});

const flatsSelectData = computed<selectDataItem[]>(() => {
  if (!projectFlats.value) return [];

  return projectFlats.value
    .filter((flat) => {
      if (activeFloor.value) {
        const isSameFloor = flat.floor_number?.toString() === activeFloor.value.floor_number?.toString();
        const isSameBlock = activeBlock.value?.id
          ? flat.block_id === activeBlock.value?.id?.toString()
          : !flat.block_id;

        return isSameFloor && isSameBlock;
      } else if (activeBlock.value) {
        return activeBlock.value.id === flat.block_id?.toString();
      } else {
        return flat;
      }
    })
    ?.map((item) => {
      const isLinked = props.polygon_data?.some((polygon) => polygon.id == item.id && polygon.type === "flat");

      return {
        title: `id: ${item.id} | ${item.flat_number.toString()} ${item.conf ? " | " + item.conf : ""}`,
        value: item.id?.toString(),
        isLinked,
        type: "flat"
      };
    });
});

watch(
  () => selectedItem.value,
  (ns) => {
    if (!key) return;

    if (props.isFloorsCanvas) {
      floorsStore.editpoligonData(key, { id: ns?.value || "", key, type: ns.type || "" });
    } else if (props.isBlockCanvas) {
      blockStore.editpoligonData(key, { id: ns?.value || "", key, type: ns.type || "" });
    } else {
      projectsStore.editpoligonData(key, { id: ns?.value || "", key, type: ns.type || "" });
    }
  }
);

onMounted(() => {
  if (!props.polygon_data) return;

  const activePolygon = props.polygon_data.find((item) => item.key === key);
  const polygonId = activePolygon?.id;
  const polygonType = activePolygon?.type;

  if (polygonId) {
    switch (polygonType) {
      case "floor":
        const activeFloor = floorsSelectData.value?.find((floor) => floor.value === polygonId);

        if (activeFloor) {
          selectedItem.value = activeFloor;
        }

        break;

      case "block":
        const activeBlock = blocksSelectData.value?.find((block) => block.value === polygonId);

        if (activeBlock) {
          selectedItem.value = activeBlock;
        }

        break;

      case "flat":
        const activeFlat = flatsSelectData.value?.find((flat) => flat.value === polygonId);

        if (activeFlat) {
          selectedItem.value = activeFlat;
        }

        break;

      default:
        break;
    }
  }

  if (props.isFloorsCanvas) {
    activeTab.value = "flat";
  } else {
    activeTab.value = polygonType || "";
  }
});
</script>

<template>
  <Transition name="fade-in-out">
    <div v-if="showModal" class="absolute right-0 top-0 min-w-[300px] rounded-l-sm bg-white p-3 shadow-lg">
      <div class="absolute right-0 top-0 cursor-pointer p-2" @click="showModal = false">
        <Close />
      </div>

      <h4 class="text-lg text-gray-900">Link Polygon To Related Data</h4>

      <div v-if="!isFloorsCanvas" class="mt-2 flex [&_div]:px-3">
        <div
          v-if="!isBlockCanvas"
          class="sidebar-item-icon icon-hover-text bg-gray-100"
          :class="{ '!bg-black text-white': activeTab === 'block' }"
          @click="activeTab = 'block'"
        >
          Block
        </div>
        <div
          class="sidebar-item-icon icon-hover-text bg-gray-100"
          :class="{ '!bg-black text-white': activeTab === 'floor' }"
          @click="activeTab = 'floor'"
        >
          Floor
        </div>

        <div
          class="sidebar-item-icon icon-hover-text bg-gray-100"
          :class="{ '!bg-black text-white': activeTab === 'flat' }"
          @click="activeTab = 'flat'"
        >
          Flat
        </div>
      </div>

      <div v-if="activeTab === 'block'" class="mt-3 flex items-center gap-3">
        <Select v-model="selectedItem" :data="blocksSelectData" />
      </div>

      <div v-else-if="activeTab === 'floor'" class="mt-3 flex flex-col items-start gap-3">
        <Select v-model="selectedItem" :data="floorsSelectData" />

        <span v-if="!floorsSelectData.length" class="text-lg text-red-500">Please add Floor!!!</span>
      </div>

      <div v-else-if="activeTab === 'flat'" class="mt-3 flex flex-col items-start gap-1">
        <p v-if="isFloorsCanvas" class="text-gray-500">Choose floor flats</p>
        <Select v-model="selectedItem" :data="flatsSelectData" />
        <span v-if="!flatsSelectData.length" class="text-lg text-red-500">Please add flat for this floor!!!</span>
      </div>
    </div>
  </Transition>
</template>
