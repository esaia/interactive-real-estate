<script setup lang="ts">
defineProps<{
  title: string;
  href?: string;
}>();
</script>

<template>
  <a :href="href">
    <button class="button">{{ title }}</button>
  </a>
</template>
