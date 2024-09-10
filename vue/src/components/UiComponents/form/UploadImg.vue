<script setup lang="ts">
import { computed, watch } from "vue";
import { useSelectImage } from "../../../composables/useSelectImage";
import Upload from "../icons/Upload.vue";
import { imageInterface } from "../../../../types/components";

const emit = defineEmits<{
  (e: "update:modelValue", params: typeof props.modelValue): void;
}>();

const props = defineProps<{
  modelValue: imageInterface | undefined;
}>();

const { selectedImage, selectImage } = useSelectImage();

watch(
  () => selectedImage.value,
  () => {
    emit("update:modelValue", selectedImage.value || undefined);
  }
);
</script>
<template>
  <div class="flex w-full flex-col gap-2">
    <button class="flex items-center justify-center gap-2" @click.prevent="selectImage">
      <Upload />
      <p>Upload Project Image</p>
    </button>
    <img v-if="selectedImage" :src="selectedImage.url" class="h-44 w-full rounded-md object-cover" />
  </div>
</template>
