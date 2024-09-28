<script setup lang="ts">
import { FlatItem, FloorItem } from "@/types/components";
import { onMounted, ref } from "vue";

import BackButton from "@/src/components/ShortcodeComponents/BackButton.vue";
import FlatIcon from "../../UiComponents/icons/FlatIcon.vue";
import Cube from "../../UiComponents/icons/Cube.vue";

const emit = defineEmits<{
  (e: "changeComponent", flow: "" | "flat" | "floor" | "block" | "project", hoveredData: any): void;
}>();

const props = defineProps<{
  flat: FlatItem | undefined;
  floors: FloorItem[] | undefined;
}>();

const show2dImage = ref(true);

const goBack = () => {
  const flatFloor = props.floors?.find(
    (floor) =>
      floor.floor_number?.toString() === props.flat?.floor_number?.toString() &&
      (props.flat.block_id ? floor.block_id : !floor.block_id)
  );

  if (flatFloor) {
    emit("changeComponent", "floor", flatFloor);
  } else {
    emit("changeComponent", "project", null);
  }
};

onMounted(() => {
  if (!props.flat?.type?.image_2d) {
    show2dImage.value = false;
  }
});
</script>
<template>
  <div class="p-5">
    <BackButton @click="goBack" />

    <div class="flex items-start justify-center gap-20">
      <div class="flex flex-col">
        <Transition name="fade-in-out" mode="out-in">
          <img
            v-if="show2dImage && flat?.type?.image_2d?.[0]?.url"
            class="h-96 w-96 bg-contain"
            :src="flat?.type?.image_2d?.[0]?.url"
            alt=""
          />

          <img
            v-else-if="flat?.type?.image_3d?.[0]?.url"
            class="h-96 w-96 bg-contain"
            :src="flat?.type?.image_3d?.[0]?.url"
            alt=""
          />
        </Transition>

        <div class="mt-10 flex w-fit items-center border-gray-400 bg-white p-1">
          <div
            v-if="flat?.type?.image_2d?.[0]?.url"
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
            v-if="flat?.type?.image_3d?.[0]?.url"
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
          <p class="text-2xl font-semibold">{{ flat?.flat_number }}</p>
          <p class="text-xs text-gray-400">Apartment</p>
        </div>

        <div class="text-center">
          <p class="text-lg">{{ flat?.type?.title }}</p>
          <p class="mt-1 text-gray-600">{{ flat?.type?.teaser }}</p>
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
