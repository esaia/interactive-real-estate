<script setup lang="ts">
import { onMounted, ref } from "vue";
import Projects from "./components/Projects.vue";
import Project from "./components/Project.vue";
import ajaxAxios from "./utils/axios";

const urlParams = new URLSearchParams(window.location.search);
const projectID = ref(urlParams.get("project"));
const project = ref();
const projects = ref();

onMounted(async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_projects",
    nonce: irePlugin.nonce,
    projectId: projectID.value
  });

  if (projectID && data.success && !data.data.length) {
    project.value = data.data;
  } else {
    projects.value = data.data;
  }
});
</script>
<template>
  <template v-if="projectID">
    <Project v-if="project" :project="project" />
    <div v-else>not found</div>
  </template>
  <Projects v-else-if="projects" :projects="projects" />
  <div v-else>error</div>
</template>
