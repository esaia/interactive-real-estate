<script setup lang="ts">
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
  </div>
</template>
