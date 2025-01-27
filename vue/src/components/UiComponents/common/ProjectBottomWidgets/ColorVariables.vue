<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ColorPicker from "../../form/ColorPicker.vue";
import { useMetaStore } from "@/src/stores/useMeta";
const metaStore = useMetaStore();

const colors = ref({
  path: "",
  path_hover: "",
  reserved: "",
  sold: "",
  stroke: "",
  stroke_width: 0
});

const metaColors = computed(() => {
  const arr: { key: string; value: any }[] = [];

  Object.entries(colors.value).forEach(async (item) => {
    if (item[0] === "stroke_width") return;
    arr.push({ key: item[0] + "_color", value: item[1] });
  });

  arr.push({ key: "stroke_width", value: colors.value.stroke_width });

  return arr;
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
  },
  { deep: true, immediate: true }
);

defineExpose({
  metaColors
});
</script>

<template>
  <div class="grid grid-cols-2 flex-col gap-4">
    <ColorPicker label="path" v-model="colors.path" :disabled="!irePlugin?.is_premium" />
    <ColorPicker label="path hover" v-model="colors.path_hover" :disabled="!irePlugin?.is_premium" />
    <ColorPicker label="reserved path" v-model="colors.reserved" :disabled="!irePlugin?.is_premium" />
    <ColorPicker label="sold path" v-model="colors.sold" :disabled="!irePlugin?.is_premium" />
    <ColorPicker label="stroke" v-model="colors.stroke" :disabled="!irePlugin?.is_premium" />

    <div>
      <label>
        <p class="label">Stroke width</p>

        <div class="flex flex-col">
          <input
            type="range"
            v-model="colors.stroke_width"
            min="0"
            max="20"
            step="0.1"
            :disabled="!irePlugin?.is_premium"
          />
        </div>
      </label>
      <p>
        {{ colors.stroke_width }}
      </p>
    </div>
  </div>
</template>
