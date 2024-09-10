<script setup lang="ts">
import { ref } from "vue";
import Button from "../form/Button.vue";
import ajaxAxios from "../../../utils/axios";
import UploadImg from "../form/UploadImg.vue";
import { imageInterface } from "../../../../types/components";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const title = ref("");
const selectedImage = ref<imageInterface>();

const onFormSubmits = async () => {
  if (!selectedImage.value?.id) return;

  try {
    await ajaxAxios.post("", {
      action: "create_project",
      nonce: irePlugin.nonce,
      title: title.value,
      project_image: selectedImage.value,
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
      <UploadImg v-model="selectedImage" />

      <Button title="Create" />
    </form>
  </div>
</template>
