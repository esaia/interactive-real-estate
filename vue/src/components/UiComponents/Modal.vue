<script setup lang="ts">
import { computed } from "vue";
import Close from "./icons/Close.vue";

defineEmits<{
  (e: "close"): void;
}>();

const props = withDefaults(
  defineProps<{
    type?: "default" | "1" | "2";
    width?: string;
    showCloseBtn?: boolean;
  }>(),
  {
    type: "default",
    showCloseBtn: true
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

// onMounted(() => {
//   document.body.style.overflow = "hidden";
// });

// onUnmounted(() => {
//   document.body.style.overflow = "visible";
// });
</script>

<template>
  <div
    class="fixed left-0 top-0 z-[99999] flex h-full w-full cursor-pointer items-center"
    :class="[
      {
        'justify-center': type === '1' || type === 'default',
        'justify-end': type === '2',
        'pointer-events-none': !showCloseBtn
      }
    ]"
  >
    <div
      class="absolute left-0 top-0 h-full w-full bg-black/40 transition-all"
      :class="{ 'backdrop-blur-sm': type !== 'default' }"
      @click="$emit('close')"
    ></div>

    <Transition :name="type === 'default' ? '' : 'slide-left'" :appear="type !== 'default'">
      <div class="relative cursor-default rounded-l-sm bg-white" :class="dynamicClasses">
        <div
          v-if="showCloseBtn"
          class="absolute right-4 top-4 z-[999] w-fit cursor-pointer rounded-md bg-white p-3 shadow-md transition-all hover:bg-gray-100 [&_path]:fill-gray-400"
          @click="$emit('close')"
        >
          <Close />
        </div>

        <div class="max-h-full min-h-full overflow-y-auto overscroll-contain p-5">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>
