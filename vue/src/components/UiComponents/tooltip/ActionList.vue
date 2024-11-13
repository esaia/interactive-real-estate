<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import Modal from "@components/UiComponents/Modal.vue";
import { ActionInterface, ActionItem } from "@/types/components";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";
import { storeToRefs } from "pinia";
import Table from "../common/table/Table.vue";
import TableTh from "../common/table/TableTh.vue";
import Pagination from "../common/Pagination.vue";
import DeleteModal from "../common/DeleteModal.vue";
import Input from "../form/Input.vue";
import Button from "../form/Button.vue";
import EmptyState from "../common/EmptyState.vue";
import CreateEditActionModal from "./CreateEditActionModal.vue";

const projectStore = useProjectStore();
const { id } = storeToRefs(projectStore);

const searchAction = ref("");
const showActionModal = ref(false);
const actions = ref<ActionInterface>();
const sortField = ref("");
const sortOrder = ref<"ASC" | "DESC" | "">("ASC");
const currentPage = ref(1);
const perPage = ref(20);

const activeAction = ref<ActionItem | null>(null);
const duplicatedAction = ref<ActionItem | null>(null);

const deleteActionId = ref<number | null>(null);
const showDeleteModal = ref(false);

const editAction = (action: ActionItem | null) => {
  activeAction.value = action;
  showActionModal.value = true;
};

const duplicateAction = (action: ActionItem | null) => {
  if (!action) return;
  duplicatedAction.value = { ...action };
  showActionModal.value = true;
};

const showDeleteActionModal = (type: ActionItem | null) => {
  if (!type) return;
  deleteActionId.value = Number(type.id);
  showDeleteModal.value = true;
};

const deleteType = async () => {
  await ajaxAxios.post("", {
    action: "ire_delete_tooltip",
    nonce: irePlugin.nonce,
    action_id: deleteActionId.value
  });
  showDeleteModal.value = false;
  fetchActions();
};

const sort = (field: string, sortOrderString: "ASC" | "DESC" | "") => {
  sortField.value = field;
  sortOrder.value = sortOrderString;

  fetchActions();
};

const fetchActions = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "ire_get_tooltip",
    nonce: irePlugin.nonce,
    project_id: id.value,
    sort_field: sortField.value,
    sort_order: sortOrder.value,
    page: currentPage.value,
    per_page: perPage.value,
    search: searchAction.value
  });

  if (!data.success) {
    return;
  }

  actions.value = data;
};

const submitForm = () => {
  fetchActions();
};

watch(
  () => currentPage.value,
  () => {
    fetchActions();
  }
);

watch(
  () => showActionModal.value,
  (ns) => {
    if (!ns) {
      fetchActions();
      activeAction.value = null;
      duplicatedAction.value = null;
    }
  }
);

onMounted(() => {
  fetchActions();
});
</script>

<template>
  <div class="mt-14">
    <form @submit.prevent="submitForm" class="mb-3 flex items-center justify-between gap-4 border-b pb-3 shadow-sm">
      <h3 class="!text-lg font-semibold capitalize">Actions</h3>

      <Input v-model="searchAction" placeholder="Filter actions list..." />

      <div class="min-w-max">
        <Button title="Add Action" outlined @click="showActionModal = true" />
      </div>
    </form>

    <div v-if="actions?.data?.length" class="relative overflow-x-auto shadow-sm">
      <Table
        :data="actions.data"
        @edit-action="(action: ActionItem | null) => editAction(action)"
        @duplicate-action="(action: ActionItem | null) => duplicateAction(action)"
        @delete-action="(action: ActionItem | null) => showDeleteActionModal(action)"
      >
        <template #header>
          <TableTh
            fieldTitle="Id"
            field="id"
            sortable
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field: any, sortOrder: any) => sort(field, sortOrder)"
          />
          <TableTh
            fieldTitle="Title"
            field="title"
            sortable
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field: any, sortOrder: any) => sort(field, sortOrder)"
          />

          <TableTh fieldTitle="Action" field="action" />
        </template>

        <template #default="action">
          <td>{{ action.slotProps?.id }}</td>
          <td>{{ action.slotProps?.title }}</td>

          <td>{{ action.slotProps?.data?.actionType }}</td>
        </template>
      </Table>

      <Pagination :totalItems="Number(actions?.total)" :perPage="perPage" v-model="currentPage" />
    </div>

    <EmptyState v-else />
  </div>

  <teleport to="#ire-vue-app">
    <Transition name="fade">
      <Modal v-if="showActionModal" @close="showActionModal = false" type="2" width="w-[500px]">
        <CreateEditActionModal
          :duplicatedAction="duplicatedAction"
          :activeAction="activeAction"
          @set-active-action="(type: any) => (activeAction = type)"
        />
      </Modal>
    </Transition>
  </teleport>

  <teleport to="#ire-vue-app">
    <Transition name="fade">
      <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
        <DeleteModal
          :text="`Are you sure you want to delete type with id ${deleteActionId || ''}?`"
          @delete-action="deleteType()"
          @cancel-action="showDeleteModal = false"
        />
      </Modal>
    </Transition>
  </teleport>
</template>
