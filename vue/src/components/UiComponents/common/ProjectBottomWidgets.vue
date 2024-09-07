<script setup lang="ts">
import Button from "../form/Button.vue";
</script>

<template>
  <div class="mt-7 flex items-start justify-between">
    <div>
      <div class="flex flex-col gap-2">
        <label for="" class="font-semibold">Project Title:</label>
        <input type="text" />
      </div>
    </div>
    <div class="flex flex-col items-end gap-3">
      <Button title="Update" @click="console.log('123123')" />
      <!-- <Button title="Back" :href="irePlugin.plugin_url" /> -->
    </div>
  </div>
</template>
