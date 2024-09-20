<script setup lang="ts">
import { onMounted, ref, Transition, watch } from "vue";
import Modal from "@components/UiComponents/Modal.vue";
import { TypeInterface, TypeItem } from "@/types/components";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";
import { storeToRefs } from "pinia";
import Table from "../common/table/Table.vue";
import TableTh from "../common/table/TableTh.vue";
import Pagination from "../common/Pagination.vue";
import DeleteModal from "../common/DeleteModal.vue";
import Input from "../form/Input.vue";
import Button from "../form/Button.vue";
import CreateEditTypeModal from "./CreateEditTypeModal.vue";

const projectStore = useProjectStore();
const { id } = storeToRefs(projectStore);

const searchType = ref("");
const showTypeModal = ref(false);
const types = ref<TypeInterface>();
const sortField = ref("");
const sortOrder = ref<"ASC" | "DESC" | "">("ASC");
const currentPage = ref(1);
const perPage = ref(20);

const activeType = ref<TypeItem | null>(null);
const duplicatedType = ref<TypeItem | null>(null);

const deleteTypeId = ref<number | null>(null);
const showDeleteModal = ref(false);

const editType = (type: TypeItem | null) => {
  activeType.value = type;
  showTypeModal.value = true;
};

const duplicateType = (type: TypeItem | null) => {
  if (!type) return;
  showTypeModal.value = true;
  duplicatedType.value = { ...type, title: type?.title ? type?.title + " - copied" : "" };
};

const showDeleteTypeModal = (type: TypeItem | null) => {
  if (!type) return;
  deleteTypeId.value = Number(type.id);
  showDeleteModal.value = true;
};

const deleteType = async () => {
  await ajaxAxios.post("", {
    action: "delete_type",
    nonce: irePlugin.nonce,
    type_id: deleteTypeId.value
  });
  showDeleteModal.value = false;
  fetchTypes();
};

const sort = (field: string, sortOrderString: "ASC" | "DESC" | "") => {
  sortField.value = field;
  sortOrder.value = sortOrderString;

  fetchTypes();
};

const fetchTypes = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_types",
    nonce: irePlugin.nonce,
    project_id: id.value,
    sort_field: sortField.value,
    sort_order: sortOrder.value,
    page: currentPage.value,
    per_page: perPage.value
  });

  if (!data.success) {
    return;
  }

  types.value = data.data;
};

watch(
  () => currentPage.value,
  () => {
    fetchTypes();
  }
);

watch(
  () => showTypeModal.value,
  (ns) => {
    if (!ns) {
      fetchTypes();

      activeType.value = null;
      duplicatedType.value = null;
    }
  }
);

onMounted(() => {
  fetchTypes();
});
</script>

<template>
  <div class="mt-14">
    <div class="mb-3 flex items-center justify-between gap-4 border-b pb-3 shadow-sm">
      <h3 class="text-lg font-semibold capitalize">Flats</h3>

      <Input v-model="searchType" placeholder="Filter flats list..." />

      <div class="min-w-max">
        <Button title="Add Type" outlined @click="showTypeModal = true" />
      </div>
    </div>

    <div class="relative overflow-x-auto shadow-sm">
      <Table
        v-if="types?.data"
        :data="types.data"
        @edit-action="(flat: TypeItem | null) => editType(flat)"
        @duplicate-action="(flat: TypeItem | null) => duplicateType(flat)"
        @delete-action="(flat: TypeItem | null) => showDeleteTypeModal(flat)"
      >
        <template #header>
          <TableTh
            fieldTitle="id"
            field="id"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />
          <TableTh
            fieldTitle="title"
            field="title"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />
          <TableTh fieldTitle="Teaser" field="teaser" />
          <TableTh fieldTitle="Area m2" field="area_m2" />
        </template>

        <template #default="type">
          <td>{{ type.slotProps?.id }}</td>
          <td>{{ type.slotProps?.title }}</td>
          <td>{{ type.slotProps?.teaser }}</td>
          <td>{{ type.slotProps?.area_m2 }}</td>
        </template>
      </Table>

      <Pagination :totalItems="Number(types?.total)" :perPage="perPage" v-model="currentPage" />
    </div>
  </div>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showTypeModal" @close="showTypeModal = false" type="2" width="w-[500px]">
        <CreateEditTypeModal
          :duplicatedType="duplicatedType"
          :activeType="activeType"
          @set-active-type="(type) => (activeType = type)"
        />
      </Modal>
    </Transition>
  </teleport>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
        <DeleteModal
          :text="`Are you sure you want to delete type with id ${deleteTypeId || ''}?`"
          @delete-action="deleteType()"
          @cancel-action="showDeleteModal = false"
        />
      </Modal>
    </Transition>
  </teleport>
</template>
