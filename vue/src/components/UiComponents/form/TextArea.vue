<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    type?: string;
    label?: string;
    required?: boolean;
    isFloat?: boolean;
  }>(),
  {
    placeholder: "",
    type: "text",
    label: ""
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", params: typeof props.modelValue): void;
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
  <div class="w-full">
    <p v-if="label" class="label">{{ label }} <span v-if="required" class="text-red-600">*</span></p>
    <textarea
      v-model="inputModel"
      class="h-full !min-h-fit w-full !border-none bg-transparent !p-2 !py-2 px-4 outline-none !ring-1 ring-gray-200 transition-all focus:!border-none focus:!shadow-none focus:!ring-2 focus:ring-primary"
      :placeholder="placeholder"
      :type="type"
      :name="placeholder"
      :required="required"
      :step="isFloat ? 0.01 : 1"
    />
  </div>
</template>
