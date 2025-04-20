<script setup lang="ts">
defineProps<{
  title: string;
  outlined?: boolean;
  disabled?: boolean;
  loading?: boolean;
}>();
</script>

<template>
  <button
    v-if="outlined"
    class="w-full rounded-md border border-slate-300 px-4 py-2 text-center text-sm text-slate-600 shadow-sm transition-all hover:border-slate-800 hover:bg-slate-800 hover:text-white hover:shadow-lg focus:border-slate-800 focus:bg-slate-800 focus:text-white active:border-slate-800 active:bg-slate-800 active:text-white disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
    type="button"
    :disabled="disabled || loading"
  >
    {{ title }}
  </button>

  <button
    v-else
    class="w-full rounded-md border border-transparent bg-gradient-to-tr from-slate-800 to-slate-700 px-4 py-2 text-center text-sm text-white shadow-md transition-all hover:bg-slate-700 hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
    type="button"
    :disabled="disabled || loading"
  >
    {{ title }}
  </button>
</template>
