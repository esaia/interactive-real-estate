<script setup lang="ts">
defineProps<{
  projects: any;
}>();
</script>

<template>
  <div class="grid grid-cols-4">
    <div v-for="project in projects" class="cursor-pointer">
      <a :href="`${irePlugin.plugin_url}&project=${project?.id}`">
        <img v-if="project.project_image" :src="project.project_image" alt="" class="h-20 w-20 hover:opacity-75" />
        <div>{{ project.title }}</div>
      </a>
    </div>
  </div>
</template>
