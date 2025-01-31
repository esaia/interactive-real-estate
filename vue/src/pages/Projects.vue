<script setup lang="ts">
import { ref } from "vue";
import ProjectItem from "../components/UiComponents/projects/ProjectItem.vue";
import AddProjectModal from "../components/UiComponents/projects/AddProjectModal.vue";
import Modal from "../components/UiComponents/Modal.vue";
import Plus from "../components/UiComponents/icons/Plus.vue";
import Block from "../components/UiComponents/icons/Block.vue";
import { pushToPlansPage } from "../composables/helpers";

defineProps<{
  projects: any;
}>();

const isModalOpen = ref(false);
</script>

<template>
  <div class="container-fluid py-3">
    <h2 class="!my-4 !text-2xl">Projects</h2>
    <div class="grid grid-cols-3 gap-6 lg:grid-cols-4">
      <div
        v-if="!irePlugin.is_premium && projects?.length >= 1"
        class="itemce flex w-full cursor-pointer justify-center rounded-xl border border-gray-300 transition-all duration-200 hover:bg-gray-200"
        :class="{ 'h-60': true }"
        @click="pushToPlansPage()"
      >
        <div class="flex -rotate-12 items-center justify-center gap-2">
          <Block />
          <p class="!text-lg font-bold text-red-700">Upgrade to add new project</p>
        </div>
      </div>

      <div
        v-else
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 transition-all duration-200 hover:bg-gray-200"
        :class="{ 'h-60': true }"
        @click="isModalOpen = true"
      >
        <Plus />
        <p class="!text-lg">New Project</p>
      </div>

      <ProjectItem v-for="project in projects" :key="project.id" :project="project"> </ProjectItem>
    </div>
  </div>

  <teleport to="#irep-vue-app">
    <transition name="fade-in-out">
      <Modal v-if="isModalOpen" @close="isModalOpen = false">
        <AddProjectModal @close="isModalOpen = false" />
      </Modal>
    </transition>
  </teleport>
</template>
