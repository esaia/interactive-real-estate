<script setup lang="ts">
import { onMounted, ref, Transition, watch } from "vue";
import Modal from "@components/UiComponents/Modal.vue";
import { FlatItem, FlatsInterface } from "@/types/components";
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
const types = ref<FlatsInterface>();
const sortField = ref("");
const sortOrder = ref<"ASC" | "DESC" | "">("ASC");
const currentPage = ref(1);
const perPage = ref(20);
const duplicatedFlat = ref<FlatItem | null>(null);

const deleteTypeId = ref<number | null>(null);
const showDeleteModal = ref(false);

const editType = (flat: FlatItem | null) => {
  //   showTypeModal.value = true;
  //   floorsStore.setActiveFloor(floor);
};

const duplicateType = (floor: FlatItem | null) => {
  //   if (!floor) return;
  //   showTypeModal.value = true;
  //   duplicatedFlat.value = { ...floor, title: floor?.title ? floor?.title + " - copied" : "" };
};

const showDeleteTypeModal = (floor: FlatItem | null) => {
  //   if (!floor) return;
  //   deleteTypeId.value = Number(floor.id);
  //   showDeleteModal.value = true;
};

const deleteType = async () => {
  //   await ajaxAxios.post("", {
  //     action: "delete_floor",
  //     nonce: irePlugin.nonce,
  //     floor_id: deleteTypeId.value
  //   });
  //   showDeleteModal.value = false;
  //   fetchFloors();
  //   floorsStore.fetchProjectFloors(id.value);
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

      //   floorsStore.setActiveFloor(null);
      duplicatedFlat.value = null;
    }
  }
);

onMounted(() => {
  fetchTypes();
});
</script>

<template>
  <div class="mt-10">
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
        @edit-action="(flat: FlatItem | null) => editType(flat)"
        @duplicate-action="(flat: FlatItem | null) => duplicateType(flat)"
        @delete-action="(flat: FlatItem | null) => showDeleteTypeModal(flat)"
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
          <TableTh fieldTitle="area_m2" field="area_m2" />
        </template>

        <template #default="type">
          <td>{{ type.slotProps?.id }}</td>
          <td>{{ type.slotProps?.title }}</td>
          <td>{{ type.slotProps?.area_m2 }}</td>
        </template>
      </Table>

      <Pagination :totalItems="Number(types?.total)" :perPage="perPage" v-model="currentPage" />
    </div>
  </div>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showTypeModal" @close="showTypeModal = false" type="2" width="w-[800px]">
        <CreateEditTypeModal :duplicatedFlat="duplicatedFlat" />
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
