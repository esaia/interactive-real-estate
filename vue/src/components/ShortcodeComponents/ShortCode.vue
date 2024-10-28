<script setup lang="ts">
import ajaxAxios from "@/src/utils/axios";
import { ShortcodeData } from "@/types/components";
import { Project } from "ire-preview";
import { onMounted, ref } from "vue";

const props = defineProps<{
  projectId: string;
  componentId: string;
}>();

const shortcodeData = ref<ShortcodeData>();

const fetchData = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_shortcode_data",
    nonce: irePlugin.nonce,
    project_id: props?.projectId || 83,
    block: "all"
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
  <div>
    <Project v-if="shortcodeData" :data="shortcodeData" />
  </div>
</template>
