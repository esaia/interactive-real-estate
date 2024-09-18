<script setup lang="ts">
import { reactive } from "vue";
import Button from "../form/Button.vue";
import Input from "../form/Input.vue";
import UploadImg from "../form/UploadImg.vue";
import ajaxAxios from "@/src/utils/axios";
import { useToast } from "vue-toast-notification";
import { useProjectStore } from "@/src/stores/useProject";
import { storeToRefs } from "pinia";

const $toast = useToast();
const projectStore = useProjectStore();
const { id } = storeToRefs(projectStore);

const obj = reactive({
  title: "",
  teaser: "",
  project_id: "",
  image_2d: null,
  image_3d: null,
  gallery: null,
  area_m2: "",
  rooms_count: "",
  project_id: id.value
});

const submitForm = async () => {
  console.log(obj);

  const { data } = await ajaxAxios.post("", {
    action: "create_type",
    nonce: irePlugin.nonce,
    ...obj
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
  <form class="h-fu' w-full rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
    <div class="flex w-full items-center justify-center bg-gray-50 p-3">
      <h2 class="text-lg">Add type</h2>
    </div>

    <div class="flex flex-col items-center gap-3 p-3">
      <Input v-model="obj.title" placeholder="" label="Type title" required />
      <Input v-model="obj.teaser" placeholder="" label="Type teaser" />

      <Input v-model="obj.area_m2" placeholder="60" label="area m²" type="number" />
      <Input v-model="obj.rooms_count" placeholder="3" label="Rooms count" type="number" />

      <UploadImg v-model="obj.image_2d" title="upload image 2d" />
      <UploadImg v-model="obj.image_3d" title="upload image 3d" />
      <UploadImg v-model="obj.gallery" title="upload gallery" multiple />

      <Button type="submit" title="add flat" />
    </div>
  </form>
</template>
