<script setup lang="ts">
import { onMounted, ref } from "vue";
import Modal from "@components/UiComponents/Modal.vue";
import AddEditFloorModal from "@/src/components/UiComponents/floors/AddEditFloorModal.vue";
import { FloorInterface } from "@/types/components";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";
import { storeToRefs } from "pinia";
import { useFloorsStore } from "@/src/stores/useFloors";
import Table from "../common/table/Table.vue";
import TableTh from "../common/table/TableTh.vue";

const projectStore = useProjectStore();
const floorsStore = useFloorsStore();
const { id } = storeToRefs(projectStore);

const showFloorModal = ref(false);
const floors = ref<FloorInterface[]>();
const sortField = ref("");
const sortOrder = ref<"ASC" | "DESC" | "">("ASC");

const editFloor = (floor: FloorInterface) => {
  showFloorModal.value = true;
  floorsStore.setActiveFloor(floor);
};

const sort = (field: string, sortOrderString: "ASC" | "DESC" | "") => {
  if (sortField.value === field) {
    sortOrder.value = sortOrderString;
  } else {
    sortField.value = field;
    sortOrder.value = "ASC";
  }
};

onMounted(async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_floors",
    nonce: irePlugin.nonce,
    project_id: id.value
  });

  if (!data.success) {
    return;
  }

  floors.value = data.data;
});
</script>

<template>
  <div class="py-4">
    <div class="mb-3 flex items-center justify-between gap-4 border-b pb-3 shadow-sm">
      <h3 class="text-lg font-semibold uppercase">Floors</h3>

      <input type="text" class="flex-1" placeholder="Filter floors list..." />

      <button class="button" @click="showFloorModal = true">Add Floor</button>
    </div>

    <div class="relative overflow-x-auto shadow-sm">
      <Table :data="floors" @edit-action="(floor: FloorInterface) => editFloor(floor)">
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
            field="floor"
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
    </div>
  </div>

  <teleport to="body">
    <transition name="fade-in-out">
      <Modal v-if="showFloorModal" @close="showFloorModal = false" type="2">
        <AddEditFloorModal />
      </Modal>
    </transition>
  </teleport>
</template>
