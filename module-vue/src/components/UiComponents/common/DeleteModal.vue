<script setup lang="ts">
import Info from "../icons/Info.vue";

defineEmits<{
  (e: "deleteAction"): void;
  (e: "cancelAction"): void;
}>();

defineProps<{ text: string }>();
</script>

<template>
  <div class="relative max-h-full w-full max-w-md">
    <div class="flex justify-center [&_svg]:h-10 [&_svg]:w-10">
      <Info />
    </div>

    <div class="text-center">
      <h3 class="!my-5 !text-lg font-normal text-gray-500">{{ text }}</h3>

      <button
        type="button"
        class="inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300"
        @click="$emit('deleteAction')"
      >
        Yes, I'm sure
      </button>
      <button
        type="button"
        class="ms-3 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100"
        @click="$emit('cancelAction')"
      >
        No, cancel
      </button>
    </div>
  </div>
</template>
