<script setup lang="ts">
import { ref } from "vue";
import ColorPicker from "../../form/ColorPicker.vue";

const colors = ref({
  path: "rgba(8, 10, 100, 0.85)",
  path_hover: "rgba(0, 132, 255, 0.45)",
  reserved: "rgba(0, 132, 255, 0.45)",
  sold: "rgba(0, 132, 255, 0.2)"
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ColorPicker label="select path color" v-model="colors.path" />
    <ColorPicker label="select path hover color" v-model="colors.path_hover" />
    <ColorPicker label="select reserved path color" v-model="colors.reserved" />
    <ColorPicker label="select sold path color" v-model="colors.sold" />
  </div>
</template>
