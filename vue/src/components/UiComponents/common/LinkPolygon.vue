<script setup lang="ts">
import { ref } from "vue";
import Select from "../form/Select.vue";

const activeTab = ref<"block" | "flat" | "floor" | "">("floor");

const selectedItem = ref();
</script>

<template>
  <div class="absolute right-0 top-0 rounded-l-md bg-white p-3 shadow-lg">
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
      <Select
        v-model="selectedItem"
        :data="[
          { title: '111', value: '1' },
          { title: '2222', value: '2' },
          { title: '333', value: '3' }
        ]"
      />
      <button class="button">Attatch</button>
    </div>
  </div>
</template>
