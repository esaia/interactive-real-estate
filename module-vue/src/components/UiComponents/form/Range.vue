<script setup lang="ts">
defineProps<{ label: string; min: string; max: string; step: string }>();

const model = defineModel();
</script>
<template>
  <div>
    <label>
      <p class="label">{{ label }}</p>

      <div class="flex flex-col">
        <input type="range" v-model="model" :min="min" :max="max" :step="step" :disabled="!irePlugin?.is_premium" />
      </div>
    </label>
    <p>
      {{ model }}
    </p>
  </div>
</template>
