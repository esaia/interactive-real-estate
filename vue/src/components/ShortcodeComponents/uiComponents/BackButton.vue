<script setup lang="ts">
import ArrowRight from "../../UiComponents/icons/ArrowRight.vue";
</script>

<template>
  <div
    class="group flex w-fit cursor-pointer items-center gap-1 bg-gray-50 px-5 py-2 transition-all hover:bg-black hover:text-white"
  >
    <ArrowRight class="w-6 rotate-180 group-hover:[&_path]:fill-white" />
    <p>Back</p>
  </div>
</template>
