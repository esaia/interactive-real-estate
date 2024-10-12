<script setup lang="ts">
import { onMounted, ref } from "vue";
import Projects from "./pages/Projects.vue";
import Project from "./pages/Project.vue";
import ajaxAxios from "./utils/axios";
import { ProjectInterface } from "../types/components";
import "vue-toast-notification/dist/theme-sugar.css";
import { useProjectStore } from "./stores/useProject";

const projectStore = useProjectStore();

const urlParams = new URLSearchParams(window.location.search);
const projectID = ref(urlParams.get("project"));
const project = ref<ProjectInterface>();
const projects = ref();

onMounted(async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_projects",
    nonce: irePlugin.nonce,
    project_id: projectID.value
  });

  if (projectID && data.success && !data.data.length) {
    project.value = data.data;
    if (project.value) {
      projectStore.setProject(project.value);
    }
  } else {
    projects.value = data.data;
  }
});
</script>

<template>
  <template v-if="projectID">
    <Project v-if="project" />
    <div v-else>not found</div>
  </template>
  <Projects v-else :projects="projects" />
  <!-- <div v-else>error</div> -->
</template>
