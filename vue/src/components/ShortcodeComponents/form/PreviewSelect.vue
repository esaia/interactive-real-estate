<script setup lang="ts">
import { selectDataItem } from "@/types/components";

withDefaults(
  defineProps<{
    data: selectDataItem[];
    placeholder?: string;
    label?: string;
    clearable?: boolean;
    required?: boolean;
  }>(),
  {
    placeholder: "Choose",
    placeholderPrefix: "",
    label: "",
    clearable: false
  }
);

const selectModel = defineModel();
</script>

<template>
  <div class="w-full max-w-[200px] lg:min-w-[250px]">
    <p class="label">{{ label }}</p>
    <div class="relative">
      <select
        v-model="selectModel"
        class="ease w-full cursor-pointer appearance-none rounded border border-slate-200 bg-transparent py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-400 focus:shadow-md focus:outline-none"
      >
        <option
          v-for="item in data"
          :value="item.value"
          :disabled="item.title.includes('reserved') || item.title.includes('sold')"
        >
          {{ item.title }}
        </option>
      </select>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.2"
        stroke="currentColor"
        class="absolute right-2.5 top-2.5 ml-1 h-5 w-5 text-slate-700"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    </div>
  </div>
</template>
