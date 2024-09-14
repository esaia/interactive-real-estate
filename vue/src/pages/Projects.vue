<script setup lang="ts">
import { ref } from "vue";
import Button from "../components/UiComponents/form/Button.vue";
import Modal from "../components/UiComponents/Modal.vue";
import Plus from "../components/UiComponents/icons/Plus.vue";
import AddProjectModal from "../components/UiComponents/projects/AddProjectModal.vue";

defineProps<{
  projects: any;
}>();

const isModalOpen = ref(false);
</script>

<template>
  <div class="container-fluid py-3">
    <h2 class="my-4 text-2xl">My Projects</h2>
    <div class="grid grid-cols-3 gap-6 lg:grid-cols-4">
      <div
        class="flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 transition-all duration-200 hover:bg-gray-200"
        @click="isModalOpen = true"
      >
        <Plus />
        <p class="text-lg">New Project</p>
      </div>

      <a
        v-for="project in projects"
        :key="project.id"
        :href="`${irePlugin.plugin_url}&project=${project?.id}`"
        class="group cursor-pointer focus:shadow-none"
      >
        <div class="relative overflow-hidden rounded-lg pt-[50%]">
          <img
            v-if="project.project_image"
            :src="project.project_image"
            alt=""
            class="absolute left-0 top-0 h-full w-full object-cover shadow-lg transition-all duration-200 hover:opacity-75 group-hover:scale-105"
          />
        </div>

        <div class="py-2 text-lg">{{ project.title }}</div>
        <Button title="View Project" />
      </a>
    </div>
  </div>

  <teleport to="#my-vue-app">
    <transition name="fade-in-out">
      <Modal v-if="isModalOpen" :bool="isModalOpen" @close="isModalOpen = false">
        <AddProjectModal @close="isModalOpen = false" />
      </Modal>
    </transition>
  </teleport>
</template>
