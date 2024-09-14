<script setup lang="ts">
import { computed, onMounted, onUnmounted, Transition } from "vue";
import Close from "./icons/Close.vue";

defineEmits<{
  (e: "close"): void;
}>();

const props = withDefaults(
  defineProps<{
    type?: "default" | "1" | "2";
    bool?: boolean;
    width?: string;
  }>(),
  {
    type: "default"
  }
);

const dynamicClasses = computed(() => {
  switch (props.type) {
    case "default":
      return "w-fit h-fit";
    case "1":
      return "w-10/12 h-full";
    case "2":
      return `h-full ${props.width || " w-10/12"}`;
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
    class="fixed left-0 top-0 z-[99999] flex h-full w-full cursor-pointer items-center bg-black/20 backdrop-blur-sm"
    :class="[{ 'justify-center': type === '1' || type === 'default', 'justify-end': type === '2' }]"
    @click="$emit('close')"
  >
    <Transition :name="type !== 'default' ? 'slide-left' : ''" appear>
      <div class="relative cursor-default rounded-l-sm bg-white p-5" :class="dynamicClasses" @click.stop="">
        <div @click="$emit('close')">
          <Close class="absolute right-4 top-4 cursor-pointer" />
        </div>

        <div class="mt-4">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>
