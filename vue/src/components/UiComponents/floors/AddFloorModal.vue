<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "vue-toast-notification";
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import UploadImg from "../form/UploadImg.vue";
import { imageInterface } from "@/types/components";

const projectStore = useProjectStore();
const { id } = storeToRefs(projectStore);
const $toast = useToast();

const title = ref("");
const floor_number = ref();
const floor_image = ref<imageInterface>();
const conf = ref("");

const createFloor = async () => {
  const params = {
    title: title.value,
    floor_number: floor_number.value,
    floor_image: floor_image.value,
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
  } else {
    $toast.error(data?.data || "Something went wrong!", {
      position: "top"
    });
  }
};
</script>

<template>
  <div class="flex gap-5">
    <div class="flex-1">Floor Canvas</div>
    <form class="mt-8 flex w-80 flex-col items-center gap-3" @submit.prevent="createFloor">
      <h2 class="text-lg">Add Floor</h2>
      <input v-model="title" type="text" class="w-full" placeholder="Floor title" />
      <input v-model="floor_number" type="number" class="w-full" placeholder="Floor number" required />

      <select v-model="conf" name="cars" id="cars" class="w-full !max-w-full">
        <option value="">conf</option>
        <option value="reserved">Reserved</option>
        <option value="sold">Sold</option>
      </select>

      <UploadImg v-model="floor_image" />

      <button class="button w-full">Add Floor</button>
    </form>
  </div>
</template>
