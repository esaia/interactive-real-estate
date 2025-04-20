<script setup lang="ts">
import { onMounted, ref } from "vue";
import Loading from "@components/Loading.vue";
import { Project } from "ire-preview";

const props = defineProps<{
  projectId: string;
}>();

const shortcodeData = ref();
const loading = ref(true);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await fetch(irePluginWp.ajax_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        action: "irep_get_shortcode_data",
        nonce: irePluginWp.nonce,
        project_id: props.projectId
      })
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.success) {
      shortcodeData.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div v-if="loading" class="relative h-full !overflow-hidden pt-[50%]">
      <div class="absolute top-0 left-0 flex h-full w-full items-center justify-center">
        <Loading />
      </div>
    </div>
    <Project v-else-if="shortcodeData" :data="shortcodeData" :translations="irePluginWp?.translations || []" />
  </div>
</template>
