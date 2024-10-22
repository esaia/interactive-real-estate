<script setup lang="ts">
import { FlatItem, FloorItem } from "@/types/components";
import { computed, onMounted, ref, watch } from "vue";

import BackButton from "@/src/components/ShortcodeComponents/uiComponents/BackButton.vue";
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
const selectedFloor = ref(0);

const floorArray = computed(() => {
  const endSlice = show2dImage.value ? props.flat?.type?.image_2d?.length : props.flat?.type?.image_3d?.length;

  return ["I", "II", "III"].slice(0, endSlice);
});

const goBack = () => {
  const flatFloor = props.floors?.find(
    (floor) =>
      floor.floor_number?.toString() === props.flat?.floor_number?.toString() &&
      (props.flat.block_id ? floor?.block_id?.toString() === props.flat.block_id : !floor.block_id)
  );

  if (flatFloor) {
    emit("changeComponent", "floor", flatFloor);
  } else {
    emit("changeComponent", "project", null);
  }
};

watch(
  () => show2dImage.value,
  () => {
    selectedFloor.value = 0;
  }
);

onMounted(() => {
  if (!props.flat?.type?.image_2d) {
    show2dImage.value = false;
  }
});
</script>
<template>
  <div>
    <div class="mb-3 flex h-[48px] items-center justify-between">
      <BackButton @click="goBack" />
    </div>

    <div class="flex flex-col items-start justify-center gap-5 lg:flex-row lg:gap-20">
      <div class="flex w-full flex-col items-center justify-center lg:w-auto">
        <Transition name="fade-in-out" mode="out-in">
          <img
            v-if="show2dImage && flat?.type?.image_2d?.[selectedFloor]?.url"
            :key="flat?.type?.image_2d?.[selectedFloor]?.url"
            :src="flat?.type?.image_2d?.[selectedFloor]?.url"
            class="h-96 w-96 object-contain"
          />

          <img
            v-else-if="flat?.type?.image_3d?.[selectedFloor]?.url"
            :src="flat?.type?.image_3d?.[selectedFloor]?.url"
            :key="flat?.type?.image_3d?.[selectedFloor]?.url"
            class="h-96 w-96 object-contain"
          />
        </Transition>

        <div class="mt-5 flex flex-col items-center gap-3 lg:flex-row">
          <div class="flex w-fit items-center gap-1 border-gray-400 bg-white p-1">
            <div
              v-if="flat?.type?.image_2d?.[0]?.url"
              class="group flex cursor-pointer items-center gap-2 rounded-lg p-3 !text-xs transition-all hover:bg-primary hover:text-white"
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
              class="group flex cursor-pointer items-center gap-2 rounded-lg p-3 !text-xs transition-all hover:bg-primary hover:text-white"
              :class="{ 'bg-primary text-white': !show2dImage }"
              @click="show2dImage = false"
            >
              <div>
                <Cube class="group-hover:[&_path]:stroke-white" :class="{ '[&_path]:!stroke-white': !show2dImage }" />
              </div>
              <p>3D plan</p>
            </div>
          </div>

          <div v-if="floorArray?.length > 1" class="ml-4 flex items-center gap-1">
            <div
              v-for="(item, index) in floorArray"
              :key="item"
              class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-black hover:text-white"
              :class="{ 'bg-black text-white': selectedFloor === index }"
              @click="selectedFloor = index"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full flex-col items-center gap-2 lg:w-auto">
        <div class="flex w-fit flex-col items-center border-b border-b-gray-200 py-4">
          <p class="!text-2xl font-semibold capitalize">{{ flat?.flat_number }}</p>
          <p class="!text-xs text-gray-600">Apartment</p>
        </div>

        <div class="text-center">
          <p class="!text-lg font-semibold">{{ flat?.type?.title }}</p>
          <p class="mt-1 text-gray-600">{{ flat?.type?.teaser }}</p>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="flat?.floor_number" class="flex w-fit flex-col items-center border-b border-b-gray-200 py-4">
            <p class="!text-2xl">{{ flat.floor_number }}</p>
            <p class="!text-xs text-gray-600">Floor</p>
          </div>

          <div v-if="flat?.type?.rooms_count" class="flex w-fit flex-col items-center border-b border-b-gray-200 py-4">
            <p class="!text-2xl">{{ flat.type.rooms_count }}</p>
            <p class="!text-xs text-gray-600">Room</p>
          </div>
        </div>

        <div class="flex w-fit flex-col items-center border-b border-b-gray-200 py-4">
          <p v-if="flat?.type?.area_m2" class="!text-2xl">
            {{ flat.type.area_m2 }}

            <span class="font-light"> M <sup class="inline-block -translate-x-1 !text-sm">2</sup> </span>
          </p>
          <p class="!text-xs text-gray-600">Area</p>
        </div>

        <div v-if="flat?.price" class="flex w-fit flex-col items-center border-b border-b-gray-200 py-4">
          <div>
            <p v-if="!flat?.offer_price" class="!text-2xl">
              {{ Number(flat.price).toLocaleString() }}<sup class="!text-sm">$</sup>
            </p>

            <div v-else>
              <p class="!text-xs line-through">
                {{ Number(flat?.price).toLocaleString() }}
              </p>
              <p class="!text-2xl">{{ Number(flat?.offer_price).toLocaleString() }}<sup class="!text-sm">$</sup></p>
            </div>
          </div>
          <p class="!text-xs text-gray-600">Price</p>
        </div>
      </div>
    </div>
  </div>
</template>
