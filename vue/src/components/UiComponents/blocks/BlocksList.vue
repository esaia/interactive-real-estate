<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import Modal from "@components/UiComponents/Modal.vue";
import { BlockInterface, BlockItem } from "@/types/components";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";
import { storeToRefs } from "pinia";
import Table from "../common/table/Table.vue";
import TableTh from "../common/table/TableTh.vue";
import Pagination from "../common/Pagination.vue";
import DeleteModal from "../common/DeleteModal.vue";
import Input from "../form/Input.vue";
import Button from "../form/Button.vue";
import { useBlocksStore } from "@/src/stores/useBlock";
import CreateEditBlockModal from "./CreateEditBlockModal.vue";
import EmptyState from "../common/EmptyState.vue";

const projectStore = useProjectStore();
const blockStore = useBlocksStore();
const { id } = storeToRefs(projectStore);

const searchBlock = ref("");
const showBlockModal = ref(false);
const blocks = ref<BlockInterface>();
const sortField = ref("");
const sortOrder = ref<"ASC" | "DESC" | "">("ASC");
const currentPage = ref(1);
const perPage = ref(20);
const duplicatedBlock = ref<BlockItem | null>(null);

const deleteBlockId = ref<number | null>(null);
const showDeleteModal = ref(false);

const editBlock = (block: BlockItem | null) => {
  showBlockModal.value = true;
  blockStore.setActiveBlock(block);
};

const duplicateBlock = (block: BlockItem | null) => {
  if (!block) return;

  showBlockModal.value = true;
  duplicatedBlock.value = { ...block };
};

const showDeleteBlockModal = (floor: BlockItem | null) => {
  if (!floor) return;

  deleteBlockId.value = Number(floor.id);
  showDeleteModal.value = true;
};

const deleteFloor = async () => {
  await ajaxAxios.post("", {
    action: "ire_delete_block",
    nonce: irePlugin.nonce,
    block_id: deleteBlockId.value
  });

  showDeleteModal.value = false;

  fetchFloors();
  blockStore.fetchProjectBLocks(id.value);
};

const sort = (field: string, sortOrderString: "ASC" | "DESC" | "") => {
  sortField.value = field;
  sortOrder.value = sortOrderString;

  fetchFloors();
};

const fetchFloors = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "ire_get_blocks",
    nonce: irePlugin.nonce,
    project_id: id.value,
    sort_field: sortField.value,
    sort_order: sortOrder.value,
    page: currentPage.value,
    per_page: perPage.value,
    search: searchBlock.value
  });

  if (!data.success) {
    return;
  }

  blocks.value = data.data;
};

const submitForm = () => {
  fetchFloors();
};

watch(
  () => currentPage.value,
  () => {
    fetchFloors();
  }
);

watch(
  () => showBlockModal.value,
  (ns) => {
    if (!ns) {
      fetchFloors();

      blockStore.setActiveBlock(null);
      duplicatedBlock.value = null;
    }
  }
);

onMounted(() => {
  fetchFloors();
});
</script>

<template>
  <div class="mt-14">
    <form @submit.prevent="submitForm" class="mb-3 flex items-center justify-between gap-4 border-b pb-3 shadow-sm">
      <h3 class="!text-lg font-semibold capitalize">Blocks</h3>

      <Input v-model="searchBlock" placeholder="Filter blocks list..." />
      <div class="min-w-max" @click="showBlockModal = true">
        <Button title="Add Block" outlined />
      </div>
    </form>

    <div v-if="blocks?.data?.length" class="relative overflow-x-auto shadow-sm">
      <Table
        :data="blocks?.data"
        @edit-action="(block: BlockItem | null) => editBlock(block)"
        @duplicate-action="(block: BlockItem | null) => duplicateBlock(block)"
        @delete-action="(block: BlockItem | null) => showDeleteBlockModal(block)"
      >
        <template #header>
          <TableTh
            fieldTitle="Id"
            field="id"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />

          <TableTh
            fieldTitle="Title"
            field="title"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />

          <TableTh
            fieldTitle="Conf"
            field="conf"
            :sortable="true"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="(field, sortOrder) => sort(field, sortOrder)"
          />
        </template>

        <template #default="floor">
          <td>{{ floor.slotProps?.id }}</td>
          <td>{{ floor.slotProps?.title }}</td>
          <td>{{ floor.slotProps?.conf }}</td>
        </template>
      </Table>

      <Pagination :totalItems="Number(blocks?.total)" :perPage="perPage" v-model="currentPage" />
    </div>

    <EmptyState v-else />
  </div>

  <teleport to="#ire-vue-app">
    <Transition name="fade">
      <Modal v-if="showBlockModal" @close="showBlockModal = false" type="2">
        <CreateEditBlockModal :duplicatedBlock="duplicatedBlock" />
      </Modal>
    </Transition>
  </teleport>

  <teleport to="#ire-vue-app">
    <Transition name="fade">
      <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
        <DeleteModal
          :text="`Are you sure you want to delete floor with id ${deleteBlockId || ''}?`"
          @delete-action="deleteFloor()"
          @cancel-action="showDeleteModal = false"
        />
      </Modal>
    </Transition>
  </teleport>
</template>
