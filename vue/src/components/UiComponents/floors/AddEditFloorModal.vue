<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "vue-toast-notification";
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import UploadImg from "../form/UploadImg.vue";
import { imageInterface } from "@/types/components";
import { useFloorsStore } from "@/src/stores/useFloors";
import Canvas from "../../Canvas.vue";
import { resetCanvasAfterSave } from "@/src/composables/helpers";

const projectStore = useProjectStore();
const floorStore = useFloorsStore();
const { id } = storeToRefs(projectStore);
const { activeFloor, activeGroup, floorSvgRef } = storeToRefs(floorStore);

const deleteG = (key: string) => {
  activeGroup.value = null;
  floorStore.removePoligonItem(key);
  floorSvgRef.value?.querySelector(`#${key}`)?.remove();
};

const $toast = useToast();

const title = ref("");
const floor_number = ref();
const floor_image = ref<imageInterface>();
const conf = ref("");

const submitForm = () => {
  if (activeFloor.value) {
    updateFloor();
  } else {
    createFloor();
  }
};

const updateFloor = async () => {
  if (floorSvgRef.value) {
    resetCanvasAfterSave(floorSvgRef.value);
  }

  const params = {
    title: title.value,
    floor_number: floor_number.value,
    floor_image: floor_image.value?.id,
    conf: conf.value,
    floor_id: activeFloor.value?.id,
    polygon_data: activeFloor.value?.polygon_data,
    svg: floorSvgRef.value?.querySelector("svg")?.outerHTML || ""
  };

  const { data } = await ajaxAxios.post("", {
    action: "update_floor",
    nonce: irePlugin.nonce,
    ...params
  });

  if (data.success) {
    $toast.success("Floor Updated!", {
      position: "top"
    });

    activeGroup.value = null;

    if (floor_image.value?.url && activeFloor.value) {
      activeFloor.value.floor_image = floor_image.value?.url;
      floor_image.value = undefined;
    }
  } else {
    $toast.error(data?.data || "Something went wrong!", {
      position: "top"
    });
  }
};

const createFloor = async () => {
  const params = {
    title: title.value,
    floor_number: floor_number.value,
    floor_image: floor_image.value?.id,
    conf: conf.value,
    project_id: id.value
  };

  const { data } = await ajaxAxios.post("", {
    action: "create_floor",
    nonce: irePlugin.nonce,
    ...params
  });

  if (data.success) {
    $toast.success("Floor created!", {
      position: "top"
    });

    floorStore.setActiveFloor(data.data);
    floor_image.value = undefined;
  } else {
    $toast.error(data?.data || "Something went wrong!", {
      position: "top"
    });
  }
};

onMounted(() => {
  if (activeFloor.value) {
    title.value = activeFloor.value.title;
    floor_number.value = activeFloor.value.floor_number;
    conf.value = activeFloor.value.conf;
  }
});
</script>

<template>
  <div class="flex gap-5">
    <div class="flex-1">
      <Canvas
        v-if="activeFloor"
        :projectImage="activeFloor?.floor_image"
        :polygon_data="activeFloor?.polygon_data"
        :svgRef="floorSvgRef"
        :svg="activeFloor.svg"
        :activeGroup="activeGroup"
        @set-svg-ref="(svgContainer) => (floorSvgRef = svgContainer)"
        @set-active-g="(gTag) => (activeGroup = gTag)"
        @delete-g="(key) => deleteG(key)"
        @add-polygon-data="(key) => floorStore.addPoligonData(key)"
      />
    </div>
    <form class="mt-6 flex w-56 flex-col items-center gap-3 border p-2 shadow-md" @submit.prevent="submitForm">
      <h2 class="text-lg">{{ activeFloor ? "Edit floor" : "Add floor" }}</h2>
      <input v-model="title" type="text" class="w-full" placeholder="Floor title" />
      <input v-model="floor_number" type="number" class="w-full" placeholder="Floor number" required />

      <select v-model="conf" name="cars" id="cars" class="w-full !max-w-full">
        <option value="">conf</option>
        <option value="reserved">Reserved</option>
        <option value="sold">Sold</option>
      </select>

      <UploadImg v-model="floor_image" />

      <button class="button w-full">{{ activeFloor ? "Edit floor" : "Add floor" }}</button>
    </form>
  </div>
</template>
