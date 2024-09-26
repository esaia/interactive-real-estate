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
import CreateEditFlatModal from "./CreateEditFlatModal.vue";

const projectStore = useProjectStore();
const { id } = storeToRefs(projectStore);

const searchFlat = ref("");
const showEditFlatModal = ref(false);
const flats = ref<FlatsInterface>();
const sortField = ref("");
const sortOrder = ref<"ASC" | "DESC" | "">("ASC");
const currentPage = ref(1);
const perPage = ref(20);

const activeFlat = ref<FlatItem | null>(null);
const duplicatedFlat = ref<FlatItem | null>(null);

const deleteFlatId = ref<number | null>(null);
const showDeleteModal = ref(false);

const editFlat = (flat: FlatItem | null) => {
  showEditFlatModal.value = true;
  activeFlat.value = flat;
};

const duplicateFlat = (flat: FlatItem | null) => {
  if (!flat) return;
  showEditFlatModal.value = true;
  duplicatedFlat.value = { ...flat, flat_number: flat?.flat_number ? flat?.flat_number + " - copied" : "" };
};

const showDeleteFlatModal = (flat: FlatItem | null) => {
  if (!flat) return;
  deleteFlatId.value = Number(flat.id);
  showDeleteModal.value = true;
};

const deleteFlat = async () => {
  await ajaxAxios.post("", {
    action: "delete_flat",
    nonce: irePlugin.nonce,
    flat_id: deleteFlatId.value
  });
  showDeleteModal.value = false;
  fetchFlats();
};

const sort = (field: string, sortOrderString: "ASC" | "DESC" | "") => {
  sortField.value = field;
  sortOrder.value = sortOrderString;

  fetchFlats();
};

const submitForm = () => {
  fetchFlats();
};

const fetchFlats = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_flats",
    nonce: irePlugin.nonce,
    project_id: id.value,
    sort_field: sortField.value,
    sort_order: sortOrder.value,
    page: currentPage.value,
    per_page: perPage.value,
    search: searchFlat.value
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
  () => showEditFlatModal.value,
  (ns) => {
    if (!ns) {
      fetchFlats();

      duplicatedFlat.value = null;
      activeFlat.value = null;
    }
  }
);

onMounted(() => {
  fetchFlats();
});
</script>

<template>
  <div class="mt-14">
    <form @submit.prevent="submitForm" class="mb-3 flex items-center justify-between gap-4 border-b pb-3 shadow-sm">
      <h3 class="text-lg font-semibold capitalize">Flats</h3>

      <Input v-model="searchFlat" placeholder="Filter flats list..." />

      <div class="min-w-max">
        <Button type="button" title="Add Flat" outlined @click="showEditFlatModal = true" />
      </div>
    </form>

    <div class="relative overflow-x-auto shadow-sm">
      <Table
        v-if="flats?.data"
        :data="flats?.data"
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

          <TableTh fieldTitle="title" field="flat_number" />

          <TableTh
            fieldTitle="floor number"
            field="floor_number"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />

          <TableTh
            fieldTitle="price"
            field="price"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />
          <TableTh
            fieldTitle="offer price"
            field="offer_price"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />
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
          <td>{{ floor.slotProps?.flat_number }}</td>
          <td>{{ floor.slotProps?.floor_number }}</td>
          <td>{{ floor.slotProps?.price }}</td>
          <td>{{ floor.slotProps?.offer_price }}</td>
          <td>{{ floor.slotProps?.conf }}</td>
        </template>
      </Table>

      <Pagination :totalItems="Number(flats?.total)" :perPage="perPage" v-model="currentPage" />
    </div>
  </div>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showEditFlatModal" @close="showEditFlatModal = false" type="2" width="w-[400px]">
        <CreateEditFlatModal
          :activeFlat="activeFlat"
          :duplicatedFlat="duplicatedFlat"
          @set-active-flat="(flat) => (activeFlat = flat)"
        />
      </Modal>
    </Transition>
  </teleport>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
        <DeleteModal
          :text="`Are you sure you want to delete flat with id ${deleteFlatId || ''}?`"
          @delete-action="deleteFlat()"
          @cancel-action="showDeleteModal = false"
        />
      </Modal>
    </Transition>
  </teleport>
</template>
