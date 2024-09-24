<script setup lang="ts">
import { FloorItem } from "@/types/components";

defineProps<{
  hoveredData: any;
  type: "" | "floor" | "flat" | "block";
}>();
</script>

<template>
  <Transition name="fade-in-out">
    <div v-if="type === 'floor'" class="absolute bottom-5 right-5 flex items-center gap-3 bg-white p-4">
      <div class="flex flex-col items-center">
        <p class="text-lg">
          {{ (hoveredData as FloorItem).floor_number }}
        </p>

        <p>Floor</p>
      </div>

      <div v-if="hoveredData?.conf || hoveredData.flats.length" class="bg-gray-100 p-3">
        <div v-if="hoveredData?.conf" class="text-lg">
          {{ hoveredData.conf }}
        </div>
        <div v-else>
          <div v-if="hoveredData?.counts?.available" class="flex items-center gap-2">
            <p class="min-w-3 text-lg">
              {{ hoveredData?.counts?.available || 0 }}
            </p>
            <p>Available</p>
          </div>

          <div v-if="hoveredData?.counts?.reserved" class="flex items-center gap-2">
            <p class="min-w-3 text-lg">
              {{ hoveredData.counts.reserved }}
            </p>
            <p>Reserved</p>
          </div>

          <div v-if="hoveredData?.counts?.sold" class="flex items-center gap-2">
            <p class="min-w-3 text-lg">
              {{ hoveredData.counts.sold }}
            </p>
            <p>Sold</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
