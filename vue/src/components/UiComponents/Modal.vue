<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import Close from "./icons/Close.vue";

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
  <div class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black/20" @click="$emit('close')">
    <div class="relative rounded-md bg-white p-5" @click.stop="">
      <div @click="$emit('close')">
        <Close class="absolute right-4 top-4 cursor-pointer" />
      </div>

      <div class="mt-4">
        <slot />
      </div>
    </div>
  </div>
</template>
