<script setup lang="ts">
defineProps<{
  modalData: any;
}>();
</script>

<template>
  <div class="mt-10 w-full md:min-w-56">
    <p class="text-2xl font-bold">{{ modalData?.modalObject?.title }}</p>
    <p>{{ modalData?.modalObject?.description }}</p>
  </div>
</template>
