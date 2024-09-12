<script setup lang="ts">
import { ref } from "vue";
import Modal from "@components/UiComponents/Modal.vue";
import Edit from "@components/UiComponents/icons/Edit.vue";
import AddFloorModal from "@components/UiComponents/floors/AddFloorModal.vue";

const showFloorModal = ref(false);
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
            <th scope="col" class="">id</th>
            <th scope="col" class="">Floor #</th>
            <th scope="col" class="">title</th>
            <th scope="col" class="">conf</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 9" class="bg-white hover:bg-gray-50 [&_td]:border [&_td]:px-2 [&_td]:py-1">
            <td class="w-20 items-center text-right">
              <div class="flex">
                <div
                  v-for="i in 3"
                  class="border-gray-10 last::bg-green-300 icon-hover-text h-fit cursor-pointer border border-r-0 p-1 transition-all first:rounded-l-sm last-of-type:rounded-r-sm last-of-type:border-r group-hover:border-gray-300"
                >
                  <Edit class="" />
                </div>
              </div>
            </td>
            <td class="">1</td>
            <td class="">{{ i }}</td>
            <td class="">floor {{ i }}</td>
            <td class=""></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <teleport to="body">
    <transition name="fade-in-out">
      <Modal v-if="showFloorModal" @close="showFloorModal = false" type="2">
        <AddFloorModal />
      </Modal>
    </transition>
  </teleport>
</template>
