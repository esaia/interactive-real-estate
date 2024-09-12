<script setup lang="ts">
import { onMounted, ref } from "vue";
import Modal from "@components/UiComponents/Modal.vue";
import Edit from "@components/UiComponents/icons/Edit.vue";
import AddEditFloorModal from "@/src/components/UiComponents/floors/AddEditFloorModal.vue";
import { FloorInterface } from "@/types/components";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";
import { storeToRefs } from "pinia";
import Delete from "../icons/Delete.vue";
import Duplicate from "../icons/Duplicate.vue";
import { useFloorsStore } from "@/src/stores/useFloors";

const projectStore = useProjectStore();
const floorsStore = useFloorsStore();
const { id } = storeToRefs(projectStore);

const showFloorModal = ref(false);
const floors = ref<FloorInterface[]>();

const editFloor = (floor: FloorInterface) => {
  showFloorModal.value = true;
  floorsStore.setActiveFloor(floor);
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
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-lg font-semibold">Floors</h3>

      <button class="button" @click="showFloorModal = true">Add Floor</button>
    </div>
    <div class="relative overflow-x-auto shadow-sm">
      <table class="w-full border-collapse text-left text-sm text-gray-500 rtl:text-right">
        <thead
          class="bg-gray-50 text-xs uppercase text-gray-700 [&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-2"
        >
          <tr>
            <th scope="col" class="w-20">Actions</th>
            <th scope="col">id</th>
            <th scope="col">Floor #</th>
            <th scope="col">title</th>
            <th scope="col">conf</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="floor in floors" class="bg-white hover:bg-gray-50 [&_td]:border [&_td]:px-2 [&_td]:py-1">
            <td class="w-20 items-center text-right">
              <div class="flex">
                <div class="floor-list-actions hover:bg-gray-400 [&_path]:hover:fill-white" @click="editFloor(floor)">
                  <Edit />
                </div>

                <div class="floor-list-actions hover:bg-blue-400 [&_path]:hover:fill-white">
                  <Duplicate />
                </div>

                <div class="floor-list-actions hover:bg-red-500 [&_path]:hover:fill-white">
                  <Delete />
                </div>
              </div>
            </td>
            <td>{{ floor.id }}</td>
            <td>{{ floor.floor_number }}</td>
            <td>{{ floor.title }}</td>
            <td>{{ floor.conf }}</td>
          </tr>
        </tbody>
      </table>
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

<style>
.floor-list-actions {
  @apply h-fit cursor-pointer border border-r-0 border-gray-200 p-1 transition-all first:rounded-l-sm last-of-type:rounded-r-sm last-of-type:border-r group-hover:border-gray-300 [&_svg]:h-4 [&_svg]:w-4;
}
</style>
