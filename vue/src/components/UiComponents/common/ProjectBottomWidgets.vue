<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useProjectStore } from "../../../stores/useProject";
import Button from "../form/Button.vue";
import ajaxAxios from "../../../utils/axios";

const projectStore = useProjectStore();
const { id, title, slug, polygon_data, svgRef, activeGroup } = storeToRefs(projectStore);
const { CIRCLE_RADIUS, PATH_COLOR } = constants;

const updateProject = async () => {
  const svg = svgRef.value?.querySelector("svg");

  if (svg) {
    const circles = svg.querySelectorAll("circle");
    circles.forEach((circle) => {
      circle.setAttribute("fill", "#00000000");
      circle.setAttribute("r", CIRCLE_RADIUS.toString());
    });

    const paths = svg.querySelectorAll("path");
    paths.forEach((path) => {
      path.setAttribute("fill", PATH_COLOR);
    });
  }

  const params = {
    projectId: id.value,
    title: title.value,
    slug: slug.value,
    svg: svgRef.value?.querySelector("svg")?.outerHTML || "",
    polygon_data: polygon_data.value
  };

  await ajaxAxios.post("", {
    action: "update_project",
    nonce: irePlugin.nonce,
    ...params
  });

  activeGroup.value = null;
};
</script>

<template>
  <div class="mt-7 flex items-start justify-between">
    <div>
      <div class="flex flex-col gap-2">
        <label for="" class="font-semibold">Project Title:</label>
        <input type="text" />
      </div>
    </div>

    <div class="flex flex-col items-end gap-3">
      <Button title="Update" @click="updateProject" />
      <!-- <Button title="Back" :href="irePlugin.plugin_url" /> -->
    </div>
  </div>
</template>
