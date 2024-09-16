<script setup lang="ts">
import { onMounted, ref, Transition, watch } from "vue";
import Modal from "@components/UiComponents/Modal.vue";
import AddEditFloorModal from "@/src/components/UiComponents/floors/AddEditFloorModal.vue";
import { FloorInterface, FloorItem } from "@/types/components";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";
import { storeToRefs } from "pinia";
import { useFloorsStore } from "@/src/stores/useFloors";
import Table from "../common/table/Table.vue";
import TableTh from "../common/table/TableTh.vue";
import Pagination from "../common/Pagination.vue";
import DeleteModal from "../common/DeleteModal.vue";

const projectStore = useProjectStore();
const floorsStore = useFloorsStore();
const { id } = storeToRefs(projectStore);

const showFloorModal = ref(false);
const floors = ref<FloorInterface>();
const sortField = ref("");
const sortOrder = ref<"ASC" | "DESC" | "">("ASC");
const currentPage = ref(1);
const perPage = ref(20);
const duplicatedFloor = ref<FloorItem | null>(null);

const deleteFloorId = ref<number | null>(null);
const showDeleteModal = ref(false);

const editFloor = (floor: FloorItem | null) => {
  showFloorModal.value = true;
  floorsStore.setActiveFloor(floor);
};

const duplicateFloor = (floor: FloorItem | null) => {
  if (!floor) return;

  showFloorModal.value = true;
  duplicatedFloor.value = { ...floor, title: floor?.title ? floor?.title + " - copied" : "" };
};

const showDeleteFloorModal = (floor: FloorItem | null) => {
  if (!floor) return;

  deleteFloorId.value = Number(floor.id);
  showDeleteModal.value = true;
};

const deleteFloor = async () => {
  await ajaxAxios.post("", {
    action: "delete_floor",
    nonce: irePlugin.nonce,
    floor_id: deleteFloorId.value
  });

  showDeleteModal.value = false;

  fetchFloors();
};

const sort = (field: string, sortOrderString: "ASC" | "DESC" | "") => {
  sortField.value = field;
  sortOrder.value = sortOrderString;

  fetchFloors();
};

const fetchFloors = async () => {
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

  floors.value = data.data;
};

watch(
  () => currentPage.value,
  () => {
    fetchFloors();
  }
);

watch(
  () => showFloorModal.value,
  (ns) => {
    if (!ns) {
      fetchFloors();

      floorsStore.setActiveFloor(null);
      duplicatedFloor.value = null;
    }
  }
);

onMounted(() => {
  fetchFloors();
});
</script>

<template>
  <div class="mt-10">
    <div class="mb-3 flex items-center justify-between gap-4 border-b pb-3 shadow-sm">
      <h3 class="text-lg font-semibold uppercase">Floors</h3>

      <input type="text" class="flex-1" placeholder="Filter floors list..." />

      <button class="button" @click="showFloorModal = true">Add Floor</button>
    </div>

    <div class="relative overflow-x-auto shadow-sm">
      <Table
        :data="floors?.data"
        @edit-action="(floor: FloorItem | null) => editFloor(floor)"
        @duplicate-action="(floor: FloorItem | null) => duplicateFloor(floor)"
        @delete-action="(floor: FloorItem | null) => showDeleteFloorModal(floor)"
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

      <Pagination :totalItems="Number(floors?.total)" :perPage="perPage" v-model="currentPage" />
    </div>
  </div>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showFloorModal" @close="showFloorModal = false" type="2">
        <AddEditFloorModal :duplicatedFloor="duplicatedFloor" />
      </Modal>
    </Transition>
  </teleport>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
        <DeleteModal
          :text="`Are you sure you want to delete floor with id ${deleteFloorId || ''}?`"
          @delete-action="deleteFloor()"
          @cancel-action="showDeleteModal = false"
        />
      </Modal>
    </Transition>
  </teleport>
</template>
