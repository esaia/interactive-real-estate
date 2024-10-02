<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ColorPicker from "../../form/ColorPicker.vue";
import { useProjectStore } from "@/src/stores/useProject";

const projectStore = useProjectStore();
const { PREVIEW_PATH_COLOR, PREVIEW_PATH_HOVER_COLOR, PREVIEW_RESERVEDD_COLOR, PREVIEW_SOLD_COLOR } = constants;

const colors = ref({
  path: PREVIEW_PATH_COLOR,
  path_hover: PREVIEW_PATH_HOVER_COLOR,
  reserved: PREVIEW_RESERVEDD_COLOR,
  sold: PREVIEW_SOLD_COLOR
});

const metaColors = computed(() => {
  const arr: { key: string; value: any }[] = [];

  Object.entries(colors.value).forEach(async (item) => {
    arr.push({ key: item[0] + "_color", value: item[1] });
  });

  return arr;
});

const getColorMeta = (metaKey: string) => {
  return projectStore.projectMeta?.find((meta) => meta.meta_key === metaKey)?.meta_value;
};

watch(
  () => projectStore.projectMeta,
  () => {
    const path_color = getColorMeta("path_color");
    const path_hover_color = getColorMeta("path_hover_color");
    const reserved_color = getColorMeta("reserved_color");
    const sold_color = getColorMeta("sold_color");

    if (path_color) {
      colors.value.path = path_color;
    }

    if (path_hover_color) {
      colors.value.path_hover = path_hover_color;
    }

    if (reserved_color) {
      colors.value.reserved = reserved_color;
    }

    if (sold_color) {
      colors.value.sold = sold_color;
    }
  },
  { deep: true, immediate: true }
);

defineExpose({
  metaColors
});
</script>

<template>
  <div class="grid grid-cols-2 flex-col gap-4">
    <ColorPicker label="path" v-model="colors.path" />
    <ColorPicker label="path hover" v-model="colors.path_hover" />
    <ColorPicker label="reserved path" v-model="colors.reserved" />
    <ColorPicker label="sold path" v-model="colors.sold" />
  </div>
</template>
