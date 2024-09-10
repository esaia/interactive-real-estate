<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import Close from "./icons/Close.vue";

defineEmits<{
  (e: "close"): void;
}>();

withDefaults(
  defineProps<{
    type?: "1" | "2" | "3";
  }>(),
  {
    type: "1"
  }
);

onMounted(() => {
  document.body.style.overflow = "hidden";
});

onUnmounted(() => {
  document.body.style.overflow = "visible";
});
</script>

<template>
  <div
    class="fixed left-0 top-0 z-[99999] flex h-full w-full items-center bg-black/20"
    :class="[{ 'justify-center': type === '1', 'justify-end': type === '2' || '3' }]"
    @click="$emit('close')"
  >
    <div
      class="relative rounded-md bg-white p-5"
      :class="[{ 'w-fit': type === '1', 'h-full w-10/12': type === '2', 'h-full w-[500px]': type === '3' }]"
      @click.stop=""
    >
      <div @click="$emit('close')">
        <Close class="absolute right-4 top-4 cursor-pointer" />
      </div>

      <div class="mt-4">
        <slot />
      </div>
    </div>
  </div>
</template>
