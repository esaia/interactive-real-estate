<script setup lang="ts">
import { ref } from "vue";
import Button from "../form/Button.vue";
import ajaxAxios from "../../../utils/axios";
import { imageInterface } from "@/types/components";
import UploadImg from "@components/UiComponents/form/UploadImg.vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const title = ref("");
const selectedImage = ref<imageInterface[] | null>(null);

const onFormSubmits = async () => {
  // if (!selectedImage.value?.length) return;

  try {
    await ajaxAxios.post("", {
      action: "create_project",
      nonce: irePlugin.nonce,
      title: title.value,
      project_image: selectedImage.value?.[0]?.id,
      svg: ""
    });
    emit("close");
  } catch (error) {}
};
</script>

<template>
  <div>
    <h3 class="mb-4 min-w-80 text-lg font-semibold">Add New Project</h3>

    <form class="flex flex-col gap-3" @submit.prevent="onFormSubmits">
      <input v-model="title" type="text" class="w-full" placeholder="project title" required />
      <UploadImg v-model="selectedImage" title="upload project image" />

      <div @click="onFormSubmits">
        <Button title="Create 1" type="submit" />
      </div>
    </form>
  </div>
</template>
