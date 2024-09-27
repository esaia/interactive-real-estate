<script setup lang="ts">
import BackButton from "../BackButton.vue";
defineEmits<{
  (e: "changeComponent", flow: "" | "flat" | "floor" | "block" | "project", hoveredData: any): void;
}>();
</script>

<template>
  <div>
    <div class="mb-3 flex items-center justify-between">
      <BackButton @click="$emit('changeComponent', 'project', null)" />
    </div>

    block preview
  </div>
</template>
