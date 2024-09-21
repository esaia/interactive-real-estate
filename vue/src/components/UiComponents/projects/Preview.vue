<script setup lang="ts">
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import { onMounted } from "vue";

const projectStore = useProjectStore();

const fetchData = async () => {
  ajaxAxios.post("", {
    action: "get_shortcode_data",
    nonce: irePlugin.nonce,
    project_id: projectStore.id
  });
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div></div>
</template>
