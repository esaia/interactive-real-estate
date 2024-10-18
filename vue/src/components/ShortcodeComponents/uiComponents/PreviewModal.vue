<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import Close from "../../UiComponents/icons/Close.vue";

defineEmits<{
  (e: "close"): void;
}>();

onMounted(() => {
  document.body.style.overflow = "hidden";
});

onUnmounted(() => {
  document.body.style.overflow = "visible";
});
</script>

<template>
  <div class="fixed left-0 top-0 z-[99999] flex h-full w-full cursor-pointer items-center justify-center p-4 lg:p-32">
    <div class="absolute left-0 top-0 h-full w-full bg-black/40 transition-all" @click="$emit('close')"></div>

    <div
      class="relative h-fit max-h-[80%] min-w-full cursor-default overflow-y-auto rounded-l-sm bg-white lg:min-w-[500px]"
    >
      <div class="sticky right-full top-0 flex w-full flex-row-reverse">
        <div
          class="z-[999] mx-3 my-2 w-fit cursor-pointer rounded-full p-1 transition-all hover:bg-gray-600 [&_path]:fill-gray-400 [&_path]:hover:fill-white [&_svg]:h-3 [&_svg]:w-3"
          @click="$emit('close')"
        >
          <Close />
        </div>
      </div>

      <div class="h-full w-full cursor-auto p-5">
        <slot />
      </div>
    </div>
  </div>
</template>
