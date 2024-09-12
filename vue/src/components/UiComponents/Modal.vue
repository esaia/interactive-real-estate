<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import Close from "./icons/Close.vue";

defineEmits<{
  (e: "close"): void;
}>();

const props = withDefaults(
  defineProps<{
    type?: "1" | "2";
    width?: string;
  }>(),
  {
    type: "1"
  }
);

const dynamicClasses = computed(() => {
  switch (props.type) {
    case "1":
      return "w-10/12";
    case "2":
      return `${props.width || "w-10/12"}`;
    default:
      return "";
  }
});

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
    :class="[{ 'justify-center': type === '1', 'justify-end': type === '2' }]"
    @click="$emit('close')"
  >
    <div class="relative h-full rounded-md bg-white p-5" :class="dynamicClasses" @click.stop="">
      <div @click="$emit('close')">
        <Close class="absolute right-4 top-4 cursor-pointer" />
      </div>

      <div class="mt-4">
        <slot />
      </div>
    </div>
  </div>
</template>
