<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useFloorsStore } from "@/src/stores/useFloors";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/src/stores/useProject";
import { PolygonDataCollection, selectDataItem } from "@/types/components";
import { useFlatsStore } from "@/src/stores/useFlats";
import { useBlocksStore } from "@/src/stores/useBlock";
import Select from "../../form/Select.vue";
import Close from "../../icons/Close.vue";
import { useActionsStore } from "@/src/stores/useActions";

const props = defineProps<{
  activeGroup: SVGGElement | null;
  polygon_data: PolygonDataCollection[] | undefined;
  isFloorsCanvas: boolean;
  isBlockCanvas?: boolean;
}>();

const key = props.activeGroup?.getAttribute("id");

const activeTab = ref<"tooltip" | "block" | "flat" | "floor" | "">("");
const selectedItem = ref<selectDataItem>({ title: "choose", value: "", isLinked: false, type: "" });
const showModal = ref(true);

const projectsStore = useProjectStore();
const floorsStore = useFloorsStore();
const blockStore = useBlocksStore();
const flatsStore = useFlatsStore();
const actionsStore = useActionsStore();
const { projectFloors, activeFloor } = storeToRefs(floorsStore);
const { projectBlocks, activeBlock } = storeToRefs(blockStore);
const { projectFlats } = storeToRefs(flatsStore);

const actionSelectData = computed<selectDataItem[]>(() => {
  if (!actionsStore.projectActions) return [];

  return actionsStore.projectActions?.map((item) => {
    // const isLinked = props.polygon_data?.some((polygon) => polygon.id == item.id && polygon.type === "tooltip");

    return {
      title: `id: ${item.id} | ${item.title}`,
      value: item.id.toString(),
      isLinked: false,
      type: "tooltip"
    };
  });
});

const blocksSelectData = computed<selectDataItem[]>(() => {
  if (!projectBlocks.value) return [];

  return projectBlocks.value?.map((item) => {
    const isLinked = props.polygon_data?.some((polygon) => polygon.id == item.id && polygon.type === "block");

    return {
      title: `id: ${item.id} | block: ${item.title} ${item.conf ? " | " + item.conf : ""}`,
      value: item.id.toString(),
      isLinked,
      type: "block"
    };
  });
});

const floorsSelectData = computed<selectDataItem[]>(() => {
  if (!projectFloors.value) return [];

  return projectFloors.value
    .filter((floor) => {
      if (activeBlock.value) {
        return activeBlock.value.id?.toString() === floor.block_id?.toString();
      }
      //  else {
      //   return !floor.block_id;
      // }
      return floor;
    })
    ?.sort((a, b) => a.floor_number - b.floor_number)
    ?.map((item) => {
      const isLinked = props.polygon_data?.some((polygon) => polygon.id == item.id && polygon.type === "floor");
      const block = projectBlocks.value?.find((block) => block.id === item?.block_id?.toString());

      return {
        title: `id: ${item.id} | floor #${item.floor_number.toString()} ${block ? " | " + block?.title : ""} ${item.conf ? " | " + item.conf : ""}`,
        value: item.id.toString(),
        isLinked,
        type: "floor"
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
          : flat.block_id
            ? flat.block_id === activeFloor.value.block_id?.toString()
            : !flat.block_id;

        return isSameFloor && isSameBlock;
      } else if (activeBlock.value) {
        return activeBlock.value.id === flat.block_id?.toString();
      } else {
        return !flat.block_id;
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
      case "tooltip":
        const activeAction = actionSelectData.value?.find((action) => action.value === polygonId);

        if (activeAction) {
          selectedItem.value = activeAction;
        }

        break;

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

  activeTab.value = polygonType || "";
});
</script>

<template>
  <div v-if="showModal" class="absolute right-0 top-0 z-[99] min-w-[300px] rounded-l-sm bg-white p-3 shadow-lg">
    <div class="absolute right-0 top-0 cursor-pointer p-2" @click="showModal = false">
      <Close />
    </div>

    <h4 class="text-lg text-gray-900">Link Polygon To Related Data</h4>

    <div class="mt-2 flex [&_div]:px-3">
      <div
        class="sidebar-item-svgicon svgicon-hover-text bg-gray-100 !px-4"
        :class="{ '!bg-black text-white': activeTab === 'tooltip' }"
        @click="activeTab = 'tooltip'"
      >
        Action
      </div>

      <template v-if="!isFloorsCanvas">
        <div
          v-if="!isBlockCanvas"
          class="sidebar-item-svgicon svgicon-hover-text bg-gray-100 !px-4"
          :class="{ '!bg-black text-white': activeTab === 'block' }"
          @click="activeTab = 'block'"
        >
          Block
        </div>
        <div
          class="sidebar-item-svgicon svgicon-hover-text bg-gray-100 !px-4"
          :class="{ '!bg-black text-white': activeTab === 'floor' }"
          @click="activeTab = 'floor'"
        >
          Floor
        </div>
      </template>

      <div
        class="sidebar-item-svgicon svgicon-hover-text bg-gray-100 !px-4"
        :class="{ '!bg-black text-white': activeTab === 'flat' }"
        @click="activeTab = 'flat'"
      >
        Flat
      </div>
    </div>

    <div v-if="activeTab === 'tooltip'" class="mt-3 flex flex-col items-start">
      <Select v-model="selectedItem" :data="actionSelectData" label="Select Action:" />
      <span v-if="!actionSelectData.length" class="mt-3 text-lg capitalize text-red-500">Please add Action!</span>
    </div>

    <div v-if="activeTab === 'block'" class="mt-3 flex flex-col items-start">
      <Select v-model="selectedItem" :data="blocksSelectData" label="Select block:" />
      <span v-if="!blocksSelectData.length" class="mt-3 text-lg capitalize text-red-500">Please add Block!</span>
    </div>

    <div v-else-if="activeTab === 'floor'" class="mt-3 flex flex-col items-start">
      <Select v-model="selectedItem" :data="floorsSelectData" label="Select floor:" />
      <span v-if="!floorsSelectData.length" class="mt-3 text-lg capitalize text-red-500">Please add Floor!</span>
    </div>

    <div v-else-if="activeTab === 'flat'" class="mt-3 flex flex-col items-start">
      <Select v-model="selectedItem" :data="flatsSelectData" label="Select flat:" />
      <span v-if="!flatsSelectData.length" class="mt-3 text-lg capitalize text-red-500">Please add flat!</span>
    </div>
  </div>
</template>
