<script setup lang="ts">
defineProps<{
  title?: string;
  desc?: string;
}>();

const checkboxModel = defineModel<any>();

// const emit = defineEmits<{
//   (e: "choose"): void;
// }>();

// const toggleCheckbox = () => {
//   emit("choose");
// };
</script>

<template>
  <label class="flex cursor-pointer items-center">
    <div>
      <input type="checkbox" v-model="checkboxModel" hidden class="!hidden" />

      <svg
        v-if="checkboxModel"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M8.45009 11.25L10.6001 13.4L15.5501 8.45C15.7334 8.26667 15.9668 8.175 16.2501 8.175C16.5334 8.175 16.7668 8.26667 16.9501 8.45C17.1334 8.63333 17.2251 8.86667 17.2251 9.15C17.2251 9.43333 17.1334 9.66667 16.9501 9.85L11.3001 15.5C11.1001 15.7 10.8668 15.8 10.6001 15.8C10.3334 15.8 10.1001 15.7 9.90009 15.5L7.05009 12.65C6.86676 12.4667 6.77509 12.2333 6.77509 11.95C6.77509 11.6667 6.86676 11.4333 7.05009 11.25C7.23343 11.0667 7.46676 10.975 7.75009 10.975C8.03342 10.975 8.26676 11.0667 8.45009 11.25ZM3.58759 20.4125C3.97926 20.8042 4.45009 21 5.00009 21H19.0001C19.5501 21 20.0209 20.8042 20.4126 20.4125C20.8043 20.0208 21.0001 19.55 21.0001 19V5C21.0001 4.45 20.8043 3.97917 20.4126 3.5875C20.0209 3.19583 19.5501 3 19.0001 3H5.00009C4.45009 3 3.97926 3.19583 3.58759 3.5875C3.19592 3.97917 3.00009 4.45 3.00009 5V19C3.00009 19.55 3.19592 20.0208 3.58759 20.4125Z"
          fill="#000000"
        />
      </svg>

      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M3.58759 20.4125C3.97926 20.8042 4.45009 21 5.00009 21H19.0001C19.5501 21 20.0209 20.8042 20.4126 20.4125C20.8043 20.0208 21.0001 19.55 21.0001 19V5C21.0001 4.45 20.8043 3.97917 20.4126 3.5875C20.0209 3.19583 19.5501 3 19.0001 3H5.00009C4.45009 3 3.97926 3.19583 3.58759 3.5875C3.19592 3.97917 3.00009 4.45 3.00009 5V19C3.00009 19.55 3.19592 20.0208 3.58759 20.4125ZM19.0001 19H5.00009V5H19.0001V19Z"
          fill="#99ADC7"
        />
      </svg>
    </div>

    <div class="ml-2 cursor-pointer text-sm text-slate-600" for="check-with-description">
      <p class="font-medium">{{ title }}</p>
      <p class="text-slate-500">{{ desc }}</p>
    </div>
  </label>
</template>
