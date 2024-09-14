<script setup lang="ts">
import { computed, ref } from "vue";
import Select from "../form/Select.vue";
import { useFloorsStore } from "@/src/stores/useFloors";
import { storeToRefs } from "pinia";
import Close from "../icons/Close.vue";

const activeTab = ref<"block" | "flat" | "floor" | "">("floor");
const selectedItem = ref();

const floorsStore = useFloorsStore();
const { projectFloors } = storeToRefs(floorsStore);

const floorsSelectData = computed(() => {
  if (!projectFloors.value) return [];

  return projectFloors.value?.map((item) => {
    return { title: item.floor_number.toString(), value: item.id.toString() };
  });
});
</script>

<template>
  <div class="absolute right-0 top-0 rounded-l-md bg-white p-3 shadow-lg">
    <div class="absolute right-0 top-0 cursor-pointer p-2">
      <Close />
    </div>

    <h4 class="text-lg text-gray-900">Link Polygon To Related Data</h4>

    <div class="mt-2 flex [&_div]:px-3">
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
      <div
        class="sidebar-item-icon icon-hover-text bg-gray-100"
        :class="{ '!bg-black text-white': activeTab === 'flat' }"
        @click="activeTab = 'flat'"
      >
        Flat
      </div>
    </div>

    <div v-if="activeTab === 'floor'" class="mt-5 flex items-center gap-3">
      <Select v-model="selectedItem" :data="floorsSelectData" />
      <button class="button">Attatch</button>
    </div>
  </div>
</template>
