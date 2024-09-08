<script setup lang="ts">
import { ref } from "vue";
import Button from "../form/Button.vue";
import Upload from "../icons/Upload.vue";
import ajaxAxios from "../../../utils/axios";
import { useSelectImage } from "../../../composables/useSelectImage";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const title = ref("");

const { selectedImage, selectImage } = useSelectImage();

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
      <button class="flex items-center justify-center gap-2" @click.prevent="selectImage">
        <Upload />
        <p>Upload Project Image</p>
      </button>
      <img v-if="selectedImage" :src="selectedImage.url" class="h-44 w-full rounded-md object-cover" />
      <Button title="Create" />
    </form>
  </div>
</template>
