<script setup lang="ts">
import { computed } from "vue";
import { ColorPicker } from "vue3-colorpicker";

const emit = defineEmits<{
  (e: "update:modelValue", params: typeof props.modelValue): void;
}>();

const props = defineProps<{
  modelValue: string;
  label?: string;
  required?: boolean;
}>();

const inputModel = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  }
});
</script>
<template>
  <div>
    <p v-if="label" class="mb-1 text-xs capitalize text-gray-600">
      {{ label }} <span v-if="required" class="text-red-600">*</span>
    </p>
    <ColorPicker v-model:pureColor="inputModel" picker-type="chrome" />
  </div>
</template>
