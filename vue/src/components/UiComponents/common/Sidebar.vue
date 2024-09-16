<script setup lang="ts">
import { ref } from "vue";
import Collapse from "../icons/Collapse.vue";
import Edit from "../icons/Edit.vue";
import { PolygonDataCollection } from "../../../../types/components";
import Info from "../icons/Info.vue";
import Eye from "../icons/Eye.vue";
import Delete from "../icons/Delete.vue";
import Unlink from "../icons/Unlink.vue";
import { useFloorsStore } from "@/src/stores/useFloors";
import AddEditFloorModal from "../floors/AddEditFloorModal.vue";
import Modal from "../Modal.vue";
const isClollapsed = ref(false);

const emit = defineEmits<{
  (e: "setActiveG", gTag: SVGGElement | null): void;
  (e: "deleteG", key: string): void;
  (e: "updatePolygonData", key: string, updatedData: PolygonDataCollection): void;
}>();

const props = defineProps<{
  polygon_data: PolygonDataCollection[] | undefined;
  activeGroup: SVGGElement | null;
  svgRef: HTMLElement | null;
}>();

const floorsStore = useFloorsStore();

const showFloorModal = ref(false);

const setActiveG = (item: PolygonDataCollection) => {
  const gTag = (props.svgRef?.querySelector(`g#${item.key}`) as SVGGElement) || null;

  if (gTag) {
    emit("setActiveG", gTag);
  }
};

const deleteG = (item: PolygonDataCollection) => {
  emit("deleteG", item.key);
};

const unlink = (key: string) => {
  emit("updatePolygonData", key, { id: "", key, type: "" });
  emit("setActiveG", null);
};

const editPolygon = (item: PolygonDataCollection) => {
  if (item.type === "floor") {
    const activeFloor = floorsStore.projectFloors?.find((floor) => floor.id === item.id);

    if (activeFloor) {
      floorsStore.setActiveFloor(activeFloor);
      showFloorModal.value = true;
    }
  }
};
</script>

<template>
  <div
    class="absolute left-0 top-0 flex h-full flex-col bg-white/70 transition-all duration-300 ease-out"
    :class="{
      '-translate-x-full': isClollapsed,
      'translate-x-0': !isClollapsed
    }"
  >
    <div
      class="absolute left-full top-1/2 translate-y-1/2 cursor-pointer rounded-r-md bg-white/60 p-1 transition-all hover:bg-white"
      @click="isClollapsed = !isClollapsed"
    >
      <Collapse
        :class="{
          'rotate-180': isClollapsed,
          'rotate-0': !isClollapsed
        }"
      />
    </div>

    <div class="flex items-center justify-between border-b p-3">
      <h3 class="text-lg">Shapes:</h3>

      <div class="cursor-pointer">
        <Info />
      </div>
    </div>

    <div class="max-h-full overflow-scroll">
      <div
        v-if="polygon_data"
        v-for="item in Object.values(polygon_data)"
        :key="item.key"
        class="group flex w-full min-w-60 cursor-pointer items-center justify-between px-3 py-3 transition-colors hover:bg-gray-200/80"
        :class="{
          'bg-gray-200/80': item.key === activeGroup?.getAttribute('id')
        }"
        @click="setActiveG(item)"
      >
        <p>shape #{{ item.key?.slice(0, 6) }}</p>

        <div class="flex">
          <template v-if="item.id">
            <div class="sidebar-item-icon icon-hover-text" @click="unlink(item.key)">
              <Unlink />
            </div>

            <div class="sidebar-item-icon icon-hover-text" @click.stop="editPolygon(item)">
              <Edit />
            </div>
          </template>

          <div class="sidebar-item-icon icon-hover-text" @click.stop="deleteG(item)">
            <Delete />
          </div>

          <div class="sidebar-item-icon icon-hover-text">
            <Eye />
          </div>
        </div>
      </div>
    </div>

    <teleport to="#my-vue-app">
      <Transition name="fade">
        <Modal v-if="showFloorModal" @close="showFloorModal = false" type="2" width="w-11/12">
          <AddEditFloorModal />
        </Modal>
      </Transition>
    </teleport>
  </div>
</template>
