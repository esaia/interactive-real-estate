<script setup lang="ts">
/**
 * @author Esaia Gaprindashvili
 */

defineProps<{
  name: string;
  label: string;
  value: string;
}>();

// const emit = defineEmits<{
//   (e: "update:modelValue", params: typeof props.modelValue): void;
// }>();

// const radioModel = computed({
//   get() {
//     return props.modelValue;
//   },
//   set(newValue) {
//     emit("update:modelValue", newValue);
//   }
// });

const model = defineModel();
</script>

<template>
  <label>
    <div class="group flex cursor-pointer items-center gap-1">
      <input v-model="model" type="radio" :name="name" class="peer invisible hidden" :value="value" />

      <div
        class="mr-1 h-3 w-3 rounded-full border-[2px] border-gray-200 bg-white ring-blue-300/40 transition-all group-active:ring-4 peer-checked:border-primary peer-checked:bg-primary"
      ></div>

      <p>
        {{ label }}
      </p>
    </div>
  </label>
</template>
