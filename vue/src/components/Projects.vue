<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";

const projects = ref();

onMounted(async () => {
  console.log("mouneted");

  const { data } = await axios.post(
    irePlugin.ajax_url,
    {
      action: "get_projects",
      nonce: irePlugin.nonce,
      projectId: undefined
    },

    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" // Set content type
      },
      withCredentials: true
    }
  );

  projects.value = data.data;

  // console.log(data);`
});
</script>

<template>
  <div v-for="project in projects" class="grid grid-cols-4">
    <div>{{ project.title }}</div>
    <img v-if="project.project_image" :src="project.project_image" alt="" class="h-20 w-20 hover:opacity-75" />
  </div>
</template>
