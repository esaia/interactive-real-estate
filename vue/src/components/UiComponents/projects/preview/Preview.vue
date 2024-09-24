<script setup lang="ts">
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import { ShortcodeData } from "@/types/components";
import { onMounted, ref } from "vue";
import ProjectPreview from "./ProjectPreview.vue";

const projectStore = useProjectStore();
const shortcodeData = ref<ShortcodeData>();

const fetchData = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_shortcode_data",
    nonce: irePlugin.nonce,
    project_id: projectStore.id
  });

  if (data.success) {
    shortcodeData.value = data.data;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <ProjectPreview v-if="shortcodeData" :shortcodeData="shortcodeData" />
</template>
