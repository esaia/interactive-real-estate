<script setup lang="ts">
import Canvas from "./Canvas.vue";

defineProps<{
  project: any;
}>();
</script>

<template>
  <div>
    <pre>
    {{ project }}
  </pre
    >
    <a :href="irePlugin.plugin_url">
      <button class="button">back</button>
    </a>
    <div class="bg-red-400">
      <Canvas />
    </div>
  </div>
</template>
