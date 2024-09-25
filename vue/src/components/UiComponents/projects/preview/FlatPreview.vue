<script setup lang="ts">
import { FlatItem, FloorItem } from "@/types/components";
import { ref } from "vue";
import ArrowRight from "../../icons/ArrowRight.vue";
import FlatIcon from "../../icons/FlatIcon.vue";
import Cube from "../../icons/Cube.vue";

const emit = defineEmits<{
  (e: "changeComponent", flow: "" | "flat" | "floor" | "block" | "project", hoveredData: any): void;
}>();

const props = defineProps<{
  flat: FlatItem | undefined;
  floors: FloorItem[] | undefined;
}>();

const show2dImage = ref(true);

const goBack = () => {
  console.log();

  const flatFloor = props.floors?.find(
    (floor) => floor.floor_number.toString() === props.flat?.floor_number.toString()
  );

  if (flatFloor) {
    emit("changeComponent", "floor", flatFloor);
  } else {
    emit("changeComponent", "project", null);
  }
};
</script>
<template>
  <div class="bg-gray-100 p-5">
    <div class="mb-10">
      <div
        class="group flex w-fit cursor-pointer items-center gap-1 bg-white px-5 py-2 transition-all hover:bg-black hover:text-white"
        @click="goBack"
      >
        <ArrowRight class="w-6 rotate-180 group-hover:[&_path]:fill-white" />
        <p>Back</p>
      </div>
    </div>

    <div class="flex items-start justify-evenly">
      <div class="flex flex-col">
        <img v-if="show2dImage" class="h-80 w-80 bg-contain" :src="flat?.type?.image_2d?.[0]?.url" alt="" />
        <img v-else class="h-80 w-80 bg-contain" :src="flat?.type?.image_3d?.[0]?.url" alt="" />

        <div class="mt-10 flex w-fit items-center border-gray-400 bg-white p-1">
          <div
            class="group flex cursor-pointer items-center gap-2 p-3 text-xs transition-all hover:bg-primary hover:text-white"
            :class="{ 'bg-primary text-white': show2dImage }"
            @click="show2dImage = true"
          >
            <FlatIcon
              class="[&_path]:stroke-black group-hover:[&_path]:stroke-white"
              :class="{ '[&_path]:!stroke-white': show2dImage }"
            />
            <p>2D plan</p>
          </div>
          <div
            class="group flex cursor-pointer items-center gap-2 p-3 text-xs transition-all hover:bg-primary hover:text-white"
            :class="{ 'bg-primary text-white': !show2dImage }"
            @click="show2dImage = false"
          >
            <div>
              <Cube class="group-hover:[&_path]:stroke-white" :class="{ '[&_path]:!stroke-white': !show2dImage }" />
            </div>
            <p>3D plan</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center gap-2">
        <div class="flex w-fit flex-col items-center border-b border-b-gray-300 py-4">
          <p class="text-2xl">{{ flat?.flat_number }}</p>
          <p class="text-xs text-gray-400">Apartment</p>
        </div>

        <div class="flex w-fit flex-col items-center border-b border-b-gray-300 py-4">
          <p class="text-2xl">{{ flat?.floor_number }}</p>
          <p class="text-xs text-gray-400">Floor</p>
        </div>

        <div class="flex w-fit flex-col items-center border-b border-b-gray-300 py-4">
          <p class="text-2xl">
            {{ flat?.type?.area_m2 }}

            <span class="font-light"> M <sup class="inline-block -translate-x-1">2</sup> </span>
          </p>
          <p class="text-xs text-gray-400">Area</p>
        </div>

        <div class="flex w-fit flex-col items-center border-b border-b-gray-300 py-4">
          <p class="text-2xl">{{ flat?.price }}$</p>
          <p class="text-xs text-gray-400">Price</p>
        </div>
      </div>
    </div>
  </div>
</template>
