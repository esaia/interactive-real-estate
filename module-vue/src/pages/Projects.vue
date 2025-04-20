<script setup lang="ts">
import { ref } from "vue";
import ProjectItem from "../components/UiComponents/projects/ProjectItem.vue";
import AddProjectModal from "../components/UiComponents/projects/AddProjectModal.vue";
import Modal from "../components/UiComponents/Modal.vue";
import Plus from "../components/UiComponents/icons/Plus.vue";
import Block from "../components/UiComponents/icons/Block.vue";
import { pushToPlansPage, showToast } from "../composables/helpers";
import Import from "../components/UiComponents/icons/Import.vue";
import ImportModal from "../components/UiComponents/projects/ImportModal.vue";

defineProps<{
  projects: any;
}>();

const addProjectModal = ref(false);
const importModal = ref(false);

const handleImportClick = () => {
  if (irePlugin.is_premium) {
    importModal.value = true;
  } else {
    showToast("error", "Upgrade plan!");
  }
};
</script>

<template>
  <div class="container-fluid py-3">
    <div class="flex items-center justify-between gap-10">
      <h2 class="!my-4 !text-2xl">Projects</h2>

      <div>
        <button
          class="inline-flex items-center rounded bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400"
          @click="handleImportClick"
        >
          <Import class="mr-2 h-4 w-4" />
          <span>import</span>
        </button>
      </div>
    </div>
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
        @click="addProjectModal = true"
      >
        <Plus />
        <p class="!text-lg">New Project</p>
      </div>

      <ProjectItem v-for="project in projects" :key="project.id" :project="project"> </ProjectItem>
    </div>

    <teleport to="#irep-vue-app">
      <transition name="fade-in-out">
        <Modal :show="addProjectModal" @close="addProjectModal = false">
          <AddProjectModal @close="addProjectModal = false" />
        </Modal>
      </transition>
    </teleport>

    <teleport to="#irep-vue-app">
      <transition name="fade-in-out">
        <Modal :show="importModal" @close="importModal = false">
          <ImportModal @close="importModal = false" />
        </Modal>
      </transition>
    </teleport>
  </div>
</template>
