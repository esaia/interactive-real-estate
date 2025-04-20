<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ColorPicker from "../../form/ColorPicker.vue";
import { useMetaStore } from "@/src/stores/useMeta";
import Range from "../../form/Range.vue";
const metaStore = useMetaStore();

const colors = ref({
  path: "",
  path_hover: "",
  reserved: "",
  sold: "",
  stroke: "",
  stroke_width: 0,
  border_radius: 0
});

const metaColors = computed(() => {
  return Object.entries(colors.value).reduce(
    (arr, [key, value]) => {
      if (key !== "stroke_width" && key !== "border_radius") {
        arr.push({ key: `${key}_color`, value });
      } else {
        arr.push({ key, value });
      }
      return arr;
    },
    [] as { key: string; value: any }[]
  );
});

watch(
  () => metaStore.projectMeta,
  () => {
    colors.value.path = metaStore.getMeta("path_color")?.meta_value.toString() || "";
    colors.value.path_hover = metaStore.getMeta("path_hover_color")?.meta_value.toString() || "";
    colors.value.reserved = metaStore.getMeta("reserved_color")?.meta_value.toString() || "";
    colors.value.sold = metaStore.getMeta("sold_color")?.meta_value.toString() || "";
    colors.value.stroke = metaStore.getMeta("stroke_color")?.meta_value.toString() || "";
    colors.value.stroke_width = Number(metaStore.getMeta("stroke_width")?.meta_value) || 0;
    colors.value.border_radius = Number(metaStore.getMeta("border_radius")?.meta_value) || 0;
  },
  { deep: true, immediate: true }
);

defineExpose({
  metaColors
});
</script>

<template>
  <div class="grid grid-cols-2 flex-col gap-4">
    <ColorPicker v-model="colors.path" label="path" :disabled="!irePlugin?.is_premium" />
    <ColorPicker v-model="colors.path_hover" label="path hover" :disabled="!irePlugin?.is_premium" />
    <ColorPicker v-model="colors.reserved" label="reserved path" :disabled="!irePlugin?.is_premium" />
    <ColorPicker v-model="colors.sold" label="sold path" :disabled="!irePlugin?.is_premium" />
    <ColorPicker v-model="colors.stroke" label="stroke" :disabled="!irePlugin?.is_premium" />
    <Range v-model="colors.stroke_width" label="Stroke width" min="0" max="20" step="0.1" />

    <div class="col-span-2">
      <Range v-model="colors.border_radius" label="Border radius" min="0" max="60" step="1" />
    </div>
  </div>
</template>
