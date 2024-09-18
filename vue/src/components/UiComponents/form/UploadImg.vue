<script setup lang="ts">
import { watch } from "vue";
import { useSelectImage } from "../../../composables/useSelectImage";
import Upload from "../icons/Upload.vue";
import { imageInterface } from "../../../../types/components";

const emit = defineEmits<{
  (e: "update:modelValue", params: typeof props.modelValue): void;
}>();

const props = defineProps<{
  modelValue: imageInterface | undefined;
  title: string;
  required?: boolean;
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
      <p>{{ title }} <span v-if="required" class="text-red-600">*</span></p>
    </button>
    <img v-if="selectedImage && modelValue" :src="selectedImage.url" class="h-44 w-full rounded-md object-cover" />
  </div>
</template>
