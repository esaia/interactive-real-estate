<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useSelectImage } from "../../../composables/useSelectImage";
import Upload from "../icons/Upload.vue";
import { imageInterface } from "../../../../types/components";
import Delete from "../icons/Delete.vue";
import Info from "../icons/Info.vue";
import Modal from "../Modal.vue";

const emit = defineEmits<{
  (e: "update:modelValue", params: typeof props.modelValue): void;
}>();

const props = defineProps<{
  modelValue: imageInterface[] | null;
  title: string;
  floorImagePreviews?: string[];
  required?: boolean;
  multiple?: boolean;
  exampleImage?: string;
  resolution?: string;
}>();

const showExampleImage = ref(false);
const { selectedImages, selectImage } = useSelectImage(props.multiple || false);

const images = computed(() => {
  if (selectedImages.value) {
    emit("update:modelValue", selectedImages.value);
  }

  return selectedImages.value;
});

const deleteImage = (id: number) => {
  if (!selectedImages.value) return;

  selectedImages.value = selectedImages.value?.filter((item) => item.id !== id);
};

onMounted(() => {
  setTimeout(() => {
    selectedImages.value = props.modelValue;
  }, 0);
});
</script>
<template>
  <div class="w-full">
    <div class="!mb-2 flex items-center justify-between">
      <p class="text-xs capitalize text-gray-600">
        {{ title }} <span v-if="required" class="text-red-600">*</span>
        <span v-if="resolution" class="text-gray-400"> - {{ resolution }}</span>
      </p>

      <div
        v-if="exampleImage"
        class="flex cursor-pointer justify-end"
        @mouseenter="showExampleImage = true"
        @mouseleave="showExampleImage = false"
      >
        <Info />
      </div>
    </div>

    <div class="flex w-full flex-wrap gap-2">
      <div
        class="flex h-24 w-24 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 p-3 transition-all hover:bg-gray-100"
        @click.prevent="selectImage"
      >
        <div class="min-w-max">
          <Upload />
        </div>
        <p>Upload</p>
      </div>
      <div
        v-for="image in images"
        class="group relative flex h-24 w-24 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-gray-300 p-2 transition-all hover:bg-gray-100"
      >
        <img :src="image?.url" class="h-full w-full rounded-md object-cover" />

        <div class="absolute left-0 top-0 h-full w-full transition-all group-hover:bg-black/30"></div>

        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-full transition-all group-hover:-translate-y-1/2 group-hover:shadow-lg [&_path]:fill-white"
          @click="deleteImage(image.id)"
        >
          <Delete />
        </div>
      </div>
    </div>

    <teleport to="#irep-vue-app">
      <Transition name="fade-in-out">
        <Modal :show="showExampleImage" :show-close-btn="false" :is-preview="true">
          <div>
            <p class="!mb-2">Example image</p>
            <img :src="exampleImage" class="max-h-[500px] w-full object-contain" />
          </div>
        </Modal>
      </Transition>
    </teleport>
  </div>
</template>
