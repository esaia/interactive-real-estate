<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import Select from "../form/Select.vue";
import { useFloorsStore } from "@/src/stores/useFloors";
import { storeToRefs } from "pinia";
import Close from "../icons/Close.vue";
import { useProjectStore } from "@/src/stores/useProject";
import { PolygonDataCollection, selectDataItem } from "@/types/components";
import { useFlatsStore } from "@/src/stores/useFlats";

const props = defineProps<{
  activeGroup: SVGGElement | null;
  polygon_data: PolygonDataCollection[] | undefined;
  isFloorsCanvas: boolean;
}>();

const key = props.activeGroup?.getAttribute("id");

const activeTab = ref<"block" | "flat" | "floor" | "">("");
const selectedItem = ref<selectDataItem>({ title: "choose", value: "", isLinked: false, type: "" });
const showModal = ref(true);

const projectsStore = useProjectStore();
const floorsStore = useFloorsStore();
const flatsStore = useFlatsStore();
const { projectFloors, activeFloor } = storeToRefs(floorsStore);
const { projectFlats } = storeToRefs(flatsStore);

const floorsSelectData = computed<selectDataItem[]>(() => {
  if (!projectFloors.value) return [];

  return projectFloors.value?.map((item) => {
    const isLinked = props.polygon_data?.some((polygon) => polygon.id == item.id && polygon.type === "floor");

    return {
      title: `floor #${item.floor_number.toString()} | id: ${item.id}`,
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
        return activeFloor.value.floor_number.toString() === flat.floor_number.toString();
      } else {
        return flat;
      }
    })
    ?.map((item) => {
      const isLinked = props.polygon_data?.some((polygon) => polygon.id == item.id && polygon.type === "flat");

      return {
        title: `${item.flat_number.toString()} | id: ${item.id} ${item.conf ? " | " + item.conf : ""}`,
        value: item.id.toString(),
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
    <div v-if="showModal" class="absolute right-0 top-0 rounded-l-md bg-white p-3 shadow-lg">
      <div class="absolute right-0 top-0 cursor-pointer p-2" @click="showModal = false">
        <Close />
      </div>

      <h4 class="text-lg text-gray-900">Link Polygon To Related Data</h4>

      <div class="mt-2 flex [&_div]:px-3">
        <template v-if="!isFloorsCanvas">
          <div
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
        </template>

        <div
          class="sidebar-item-icon icon-hover-text bg-gray-100"
          :class="{ '!bg-black text-white': activeTab === 'flat' }"
          @click="activeTab = 'flat'"
        >
          Flat
        </div>
      </div>

      <div v-if="activeTab === 'floor'" class="mt-5 flex items-center gap-3">
        <Select v-model="selectedItem" :data="floorsSelectData" itemPrefix="floor #" />
      </div>

      <div v-if="activeTab === 'flat'" class="mt-5 flex items-center gap-3">
        <Select v-model="selectedItem" :data="flatsSelectData" itemPrefix="floor #" />
      </div>
    </div>
  </Transition>
</template>
