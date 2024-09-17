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
import AddEditFlatModal from "./CreateEditFlatModal.vue";
import Input from "../form/Input.vue";

const projectStore = useProjectStore();
const { id } = storeToRefs(projectStore);

const searchFlat = ref("");
const showFloorModal = ref(false);
const flats = ref<FlatsInterface>();
const sortField = ref("");
const sortOrder = ref<"ASC" | "DESC" | "">("ASC");
const currentPage = ref(1);
const perPage = ref(20);
const duplicatedFlat = ref<FlatItem | null>(null);

const deleteFlatId = ref<number | null>(null);
const showDeleteModal = ref(false);

const editFlat = (flat: FlatItem | null) => {
  //   showFloorModal.value = true;
  //   floorsStore.setActiveFloor(floor);
};

const duplicateFlat = (floor: FlatItem | null) => {
  //   if (!floor) return;
  //   showFloorModal.value = true;
  //   duplicatedFlat.value = { ...floor, title: floor?.title ? floor?.title + " - copied" : "" };
};

const showDeleteFlatModal = (floor: FlatItem | null) => {
  //   if (!floor) return;
  //   deleteFlatId.value = Number(floor.id);
  //   showDeleteModal.value = true;
};

const deleteFlat = async () => {
  //   await ajaxAxios.post("", {
  //     action: "delete_floor",
  //     nonce: irePlugin.nonce,
  //     floor_id: deleteFlatId.value
  //   });
  //   showDeleteModal.value = false;
  //   fetchFloors();
  //   floorsStore.fetchProjectFloors(id.value);
};

const sort = (field: string, sortOrderString: "ASC" | "DESC" | "") => {
  sortField.value = field;
  sortOrder.value = sortOrderString;

  fetchFlats();
};

const fetchFlats = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_floors",
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

  flats.value = data.data;
};

watch(
  () => currentPage.value,
  () => {
    fetchFlats();
  }
);

watch(
  () => showFloorModal.value,
  (ns) => {
    if (!ns) {
      fetchFlats();

      //   floorsStore.setActiveFloor(null);
      duplicatedFlat.value = null;
    }
  }
);

onMounted(() => {
  fetchFlats();
});
</script>

<template>
  <div class="mt-10">
    <div class="mb-3 flex items-center justify-between gap-4 border-b pb-3 shadow-sm">
      <h3 class="text-lg font-semibold uppercase">Flats</h3>

      <Input v-model="searchFlat" placeholder="Filter flats list..." />

      <button class="button" @click="showFloorModal = true">Add Flat</button>
    </div>

    <div class="relative overflow-x-auto shadow-sm">
      <Table
        :data="[]"
        @edit-action="(flat: FlatItem | null) => editFlat(flat)"
        @duplicate-action="(flat: FlatItem | null) => duplicateFlat(flat)"
        @delete-action="(flat: FlatItem | null) => showDeleteFlatModal(flat)"
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
            fieldTitle="floor"
            field="floor_number"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />
          <TableTh fieldTitle="title" field="title" />
          <TableTh
            fieldTitle="conf"
            field="conf"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />
        </template>

        <template #default="floor">
          <td>{{ floor.slotProps?.id }}</td>
          <td>{{ floor.slotProps?.floor_number }}</td>
          <td>{{ floor.slotProps?.title }}</td>
          <td>{{ floor.slotProps?.conf }}</td>
        </template>
      </Table>

      <Pagination :totalItems="Number(flats?.total)" :perPage="perPage" v-model="currentPage" />
    </div>
  </div>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showFloorModal" @close="showFloorModal = false" type="2" width="w-[400px]">
        <AddEditFlatModal :duplicatedFlat="duplicatedFlat" />
      </Modal>
    </Transition>
  </teleport>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
        <DeleteModal
          :text="`Are you sure you want to delete floor with id ${deleteFlatId || ''}?`"
          @delete-action="deleteFlat()"
          @cancel-action="showDeleteModal = false"
        />
      </Modal>
    </Transition>
  </teleport>
</template>
