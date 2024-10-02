<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import ColorPicker from "../../form/ColorPicker.vue";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";

const projectStore = useProjectStore();

const colors = ref({
  path: "rgba(160, 160, 173, 0.49)",
  path_hover: "rgba(160, 160, 173, 0.80)",
  reserved: "rgba(255, 247, 89, 0.45)",
  sold: "rgba(219, 64, 64, 0.45)"
});

const saveColors = () => {
  Object.entries(colors.value).forEach(async (item) => {
    await ajaxAxios.post("", {
      action: "ire_create_or_update_meta",
      nonce: irePlugin.nonce,
      project_id: projectStore.id,
      meta_key: item[0] + "_color",
      meta_value: item[1]
    });
    projectStore.getProjectMeta();
  });
};

watch(
  () => colors.value,
  () => {
    console.log(colors.value);
  },
  { deep: true }
);

onMounted(() => {
  // saveColors();
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
