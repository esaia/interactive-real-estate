<script setup lang="ts">
import { ref } from "vue";
import FloorsList from "../floors/FloorsList.vue";
import Building from "../icons/Building.vue";
import Flat from "../icons/Flat.vue";
import Floor from "../icons/floor.vue";
import Stack from "../icons/Stack.vue";
import Modal from "../Modal.vue";

const showModal = ref<"block" | "floor" | "flat" | "type" | "">("floor");
</script>

<template>
  <div class="flex w-full items-center gap-3">
    <div class="modal-box-item" @click="showModal = 'block'">
      <Building />
      <div>
        <h4 class="font-semibold">Blocks</h4>
        <p>2 block</p>
      </div>
    </div>

    <div class="modal-box-item" @click="showModal = 'floor'">
      <Floor />
      <div>
        <h4 class="font-semibold">Floors</h4>
        <p>12 floor</p>
      </div>
    </div>

    <div class="modal-box-item" @click="showModal = 'flat'">
      <Flat />
      <div>
        <h4 class="font-semibold">Flats</h4>
        <p>55 flat</p>
      </div>
    </div>

    <div class="modal-box-item" @click="showModal = 'type'">
      <Stack />
      <div>
        <h4 class="font-semibold">Types</h4>
        <p>5 type</p>
      </div>
    </div>

    <teleport to="body">
      <transition name="fade-in-out">
        <Modal v-if="showModal === 'floor'" type="2" width="w-11/12" @close="showModal = ''">
          <FloorsList />
        </Modal>
      </transition>
    </teleport>
  </div>
</template>

<style>
.modal-box-item {
  @apply flex flex-1 cursor-pointer items-center gap-3 rounded-md border bg-white px-4 py-5 ring-primary transition-all hover:bg-gray-100 hover:ring-1 [&_path]:fill-gray-700 [&_svg]:h-[40px] [&_svg]:w-[40px];
}
</style>
