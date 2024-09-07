<script setup lang="ts">
import { ref } from "vue";
import Collapse from "../icons/Collapse.vue";
import Edit from "../icons/Edit.vue";
const isClollapsed = ref(false);
</script>

<template>
  <div
    class="absolute left-0 top-0 rotate-180 cursor-pointer bg-white/80 transition-all duration-150 ease-out"
    :class="{
      '-translate-x-full': !isClollapsed,
      'translate-x-0 delay-300': isClollapsed
    }"
    @click="isClollapsed = false"
  >
    <Collapse class="icon-hover" />
  </div>

  <div
    class="absolute left-0 top-0 flex h-full flex-col bg-white/70 transition-all duration-300 ease-out"
    :class="{
      '-translate-x-full': isClollapsed,
      'translate-x-0': !isClollapsed
    }"
  >
    <div class="flex items-center justify-between border-b p-3">
      <h3 class="text-lg">Shapes:</h3>

      <div class="cursor-pointer" @click="isClollapsed = true">
        <Collapse />
      </div>
    </div>

    <div
      v-for="item in 8"
      class="flex w-full min-w-60 cursor-pointer items-center justify-between px-3 py-3 transition-colors hover:bg-gray-100/40"
    >
      <p>shape #21</p>

      <div class="flex">
        <div
          v-for="item in 3"
          class="border-gray-10 last::bg-green-300 icon-hover-text group h-fit cursor-pointer border border-r-0 p-1 transition-all first:rounded-l-sm last-of-type:rounded-r-sm last-of-type:border-r"
        >
          <Edit class="" />
        </div>
      </div>
    </div>
  </div>
</template>
