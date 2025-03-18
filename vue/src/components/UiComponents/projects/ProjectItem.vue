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
      action: "irep_delete_project",
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

const downloadJson = (data: any, id: number) => {
  // Convert the data to a Blob and trigger a download
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create an anchor element and trigger a download
  const a = document.createElement("a");
  a.href = url;
  a.download = `project_${id}.json`;
  a.click();

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

const exportProject = async (id: number) => {
  if (!id) {
    return showToast("error", "Something went wrong!");
  }

  const { data } = await ajaxAxios.post("", {
    action: "irep_export",
    nonce: irePlugin.nonce,
    project_id: id
  });

  if (data.success) {
    downloadJson(data?.data, id);
  } else {
    showToast("error", data?.data ? data.data : "Upgrade plan!");
  }
};

const handleExportClick = (e: any) => {
  if (!irePlugin.is_premium) {
    showToast("error", "Upgrade plan!");
    e.stopPropagation();
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

    <div class="flex w-full items-center justify-between gap-3">
      <div class="flex w-full flex-wrap justify-between gap-2">
        <a :href="`${irePlugin.plugin_url}&project=${project?.id}`">
          <Button title="View Project" />
        </a>

        <div class="w-fit" @click="handleExportClick">
          <Button
            title="Export"
            :outlined="true"
            :disabled="!irePlugin?.is_premium"
            @click="exportProject(+project?.id || 0)"
          />
        </div>
      </div>

      <div class="cursor-pointer rounded-md [&_path]:fill-red-600" @click.stop="showDeleteModal = true">
        <Delete />
      </div>
    </div>
  </div>

  <Teleport to="#irep-vue-app">
    <Transition name="fade">
      <Modal :show="showDeleteModal" @close="showDeleteModal = false">
        <DeleteModal
          :text="`Are you sure you want to delete project with id ${project?.id || ''}?`"
          @delete-action="deleteFlat()"
          @cancel-action="showDeleteModal = false"
        />
      </Modal>
    </Transition>
  </Teleport>
</template>
