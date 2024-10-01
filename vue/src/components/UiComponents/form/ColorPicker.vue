<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
const emit = defineEmits<{
  (e: "update:modelValue", params: string): void;
}>();

const props = defineProps<{
  label: string;
  modelValue: string;
}>();

const opacity = ref(1);

const rgbaString = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  }
});

const parseColor = (color: string) => {
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*(?:\.\d+)?))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
    };
  }

  if (color.startsWith("#")) {
    const hex = color.length === 7 ? color.slice(1) : color[1].repeat(2) + color[2].repeat(2) + color[3].repeat(2);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: opacity.value
    };
  }

  throw new Error("Invalid color format");
};

const convertToRgb = (color: string) => {
  const { r, g, b } = parseColor(color);
  rgbaString.value = `rgba(${r}, ${g}, ${b}, ${opacity.value})`;
};

// const convertRgbToHex = (rgba: string) => {
//   const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
//   if (!match) return null;

//   const r = parseInt(match[1]).toString(16).padStart(2, "0");
//   const g = parseInt(match[2]).toString(16).padStart(2, "0");
//   const b = parseInt(match[3]).toString(16).padStart(2, "0");

//   return `#${r}${g}${b}`;
// }

watch(rgbaString, () => {
  convertToRgb(rgbaString.value);
});

watch(opacity, () => {
  convertToRgb(rgbaString.value);
});

onMounted(() => {
  const { a } = parseColor(props.modelValue);
  opacity.value = a;
});
</script>

<template>
  <div>
    <p class="mb-1 text-xs capitalize text-gray-600">{{ label }}</p>

    <div class="flex items-start gap-1">
      <label :for="label">
        <div
          class="color-display h-5 w-5 cursor-pointer rounded-full"
          :style="{ backgroundColor: rgbaString }"
          aria-label="Selected Color"
        ></div>
      </label>
      <input :id="label" type="color" v-model="rgbaString" aria-label="Color Picker" class="h-0 w-0 opacity-0" />

      <div class="flex flex-1 flex-col gap-1">
        <input
          type="range"
          v-model="opacity"
          min="0"
          max="1"
          step="0.01"
          aria-label="Opacity Control"
          class="w-full cursor-pointer appearance-none bg-transparent focus:outline-none [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:ease-in-out [&::-moz-range-track]:h-2 [&::-moz-range-track]:w-full [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-gray-100 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gray-200 [&::-webkit-slider-thumb]:-mt-0.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_4px] [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-in-out"
        />
        <p class="text-gray-500">
          {{ rgbaString }}
        </p>
      </div>
    </div>
  </div>
</template>
