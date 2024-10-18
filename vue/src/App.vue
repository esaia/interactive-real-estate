<script setup lang="ts">
import { onMounted, ref } from "vue";
import Projects from "./pages/Projects.vue";
import Project from "./pages/Project.vue";
import "vue-toast-notification/dist/theme-sugar.css";
import { useProjectStore } from "./stores/useProject";
import { storeToRefs } from "pinia";

const projectStore = useProjectStore();

const { projects, project } = storeToRefs(projectStore);

const urlParams = new URLSearchParams(window.location.search);
const projectID = ref(urlParams.get("project"));

onMounted(async () => {
  projectStore.fetchProjects(projectID.value);
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
