<script setup lang="ts">
import { BlockItem, FloorItem, TypeItem } from "@/types/components";

defineProps<{
  hoveredData: any;
  type: "flat" | "floor" | "block" | "tooltip" | "";
}>();
</script>

<template>
  <Transition name="fade-in-out">
    <div
      v-if="type && hoveredData"
      class="pointer-events-none absolute !bottom-10 !right-10 w-fit select-none border bg-white p-4"
    >
      <div v-if="type === 'floor'" class="flex items-center gap-3">
        <div class="flex flex-col items-center">
          <p class="!text-2xl">{{ (hoveredData as FloorItem).floor_number }}</p>

          <p class="!text-sm uppercase">Floor</p>
        </div>

        <div v-if="hoveredData?.conf || hoveredData?.flats?.length" class="bg-gray-100 px-5 py-2">
          <div v-if="hoveredData?.conf" class="!text-2xl">
            {{ hoveredData.conf }}
          </div>
          <div v-else>
            <div v-if="hoveredData?.counts?.available" class="flex items-center gap-2">
              <p class="min-w-3 !text-2xl">
                {{ hoveredData?.counts?.available || 0 }}
              </p>
              <p class="!text-sm uppercase">Available</p>
            </div>

            <div v-if="hoveredData?.counts?.reserved" class="flex items-center gap-2">
              <p class="min-w-3 !text-2xl">
                {{ hoveredData.counts.reserved }}
              </p>
              <p class="!text-sm uppercase">Reserved</p>
            </div>

            <div v-if="hoveredData?.counts?.sold" class="flex items-center gap-2">
              <p class="min-w-3 !text-2xl">
                {{ hoveredData.counts.sold }}
              </p>
              <p class="!text-sm uppercase">Sold</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="type === 'block'" class="flex items-center gap-3">
        <div class="flex flex-col items-center">
          <p class="!text-2xl">
            {{ (hoveredData as BlockItem).title }}
          </p>
        </div>
      </div>

      <div v-else-if="type === 'flat'" class="flex w-full flex-col items-center gap-3">
        <div class="flex flex-col items-center">
          <p class="!text-2xl">{{ hoveredData?.flat_number }}</p>

          <p class="!mt-2 !text-xs uppercase">Apartment</p>
        </div>

        <div class="flex min-w-36 flex-col items-center bg-gray-100 px-7 py-3">
          <p v-if="hoveredData?.conf" class="!text-2xl uppercase">{{ hoveredData.conf }}</p>

          <template v-else>
            <p class="!text-xs uppercase text-gray-500">Price</p>
            <p class="!text-2xl">{{ Number(hoveredData?.price).toLocaleString() }}$</p>
          </template>
        </div>

        <div class="border border-gray-800 p-2">
          <p class="translate-x-3 bg-white">{{ (hoveredData?.type as TypeItem)?.area_m2 }} M<sup>2</sup></p>
        </div>
      </div>
    </div>
  </Transition>
</template>
