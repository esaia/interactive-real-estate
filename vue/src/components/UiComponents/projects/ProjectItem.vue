<script setup lang="ts">
import { ref } from "vue";
import DeleteModal from "@/src/components/UiComponents/common/DeleteModal.vue";
import Button from "@/src/components/UiComponents/form/Button.vue";
import Delete from "@/src/components/UiComponents/icons/Delete.vue";
import Modal from "@/src/components/UiComponents/Modal.vue";
import { ProjectInterface } from "@/types/components";
import ajaxAxios from "@/src/utils/axios";
import { showToast } from "@/src/composables/helpers";
import { useProjectStore } from "@/src/stores/useProject";

const props = defineProps<{
  project: ProjectInterface;
}>();

const projectStore = useProjectStore();

const showDeleteModal = ref(false);

const deleteFlat = async () => {
  try {
    const { data } = await ajaxAxios.post("", {
      action: "ire_delete_project",
      nonce: irePlugin.nonce,
      project_id: props.project?.id
    });

    if (data?.success) {
      showToast("success", "Project deleted successfully!");
      showDeleteModal.value = false;
      projectStore.fetchProjects(null);
    } else {
      showToast("error", "Something went wrong!");
    }
  } catch (error) {
    showToast("error", "Something went wrong!");
  }
};
</script>
<template>
  <div class="focus:shadow-none">
    <div class="group relative overflow-hidden rounded-lg pt-[50%]">
      <img
        v-if="project.project_image.length"
        :src="project.project_image?.[0]?.url"
        alt=""
        class="absolute left-0 top-0 h-full w-full object-cover shadow-lg transition-all duration-200 hover:opacity-75 group-hover:scale-105"
      />
    </div>

    <div class="line-clamp-1 py-2 text-lg">{{ project.title }}</div>

    <div class="flex items-center justify-between gap-3">
      <a :href="`${irePlugin.plugin_url}&project=${project?.id}`">
        <Button title="View Project" />
      </a>

      <div class="cursor-pointer rounded-md [&_path]:fill-red-600" @click.stop="showDeleteModal = true">
        <Delete />
      </div>
    </div>
  </div>

  <Teleport to="#ire-vue-app">
    <Transition name="fade">
      <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
        <DeleteModal
          :text="`Are you sure you want to delete project with id ${project?.id || ''}?`"
          @delete-action="deleteFlat()"
          @cancel-action="showDeleteModal = false"
        />
      </Modal>
    </Transition>
  </Teleport>
</template>
