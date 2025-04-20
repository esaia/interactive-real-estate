<script setup lang="ts">
import Radio from "../../form/Radio.vue";

const tooltipModel = defineModel();
</script>

<template>
  <div class="relative flex w-full max-w-sm flex-col rounded-xl bg-white">
    <div class="flex min-w-[240px] flex-col gap-1">
      <label
        v-for="i in 4"
        class="flex w-full cursor-pointer flex-col items-start overflow-hidden rounded-lg p-0 transition-all hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"
      >
        <div class="inline-flex w-full items-center justify-between p-2">
          <Radio v-model="tooltipModel" :label="`Tooltip ${i}`" name="tooltip" :value="i.toString()" />
        </div>
      </label>
    </div>
  </div>
</template>
