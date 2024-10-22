<script setup lang="ts">
import ArrowRight from "../../UiComponents/icons/ArrowRight.vue";
</script>

<template>
  <div
    class="group flex w-fit cursor-pointer items-center gap-1 rounded-lg bg-gray-50 px-4 py-1 transition-all hover:bg-black hover:text-white lg:px-5 lg:py-2"
  >
    <ArrowRight class="w-6 rotate-180 group-hover:[&_path]:fill-white" />
    <p>Back</p>
  </div>
</template>
