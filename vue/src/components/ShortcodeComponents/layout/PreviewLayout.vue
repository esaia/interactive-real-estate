<script setup lang="ts">
import Tooltip_1 from "../preview/Tooltip_1.vue";

defineProps<{
  hoverdData: any;
  type?: any;
}>();
</script>

<template>
  <div class="relative">
    <div class="mb-3 flex h-[48px] items-center justify-between">
      <slot name="header" />
    </div>

    <slot />

    <Tooltip_1 :hovered-data="hoverdData" :type="type || ''" class="hidden lg:block" />
  </div>
</template>
