<script setup lang="ts">
import { ref, watch } from "vue";
import Collapse from "../icons/Collapse.vue";
import Edit from "../icons/Edit.vue";
import { BlockItem, FlatItem, FloorItem, PolygonDataCollection } from "../../../../types/components";
import Info from "../icons/Info.vue";
import Eye from "../icons/Eye.vue";
import Delete from "../icons/Delete.vue";
import Unlink from "../icons/Unlink.vue";
import { useFloorsStore } from "@/src/stores/useFloors";
import Modal from "../Modal.vue";
import { useFlatsStore } from "@/src/stores/useFlats";
import CreateEditFlatModal from "../flats/CreateEditFlatModal.vue";
import CreateEditFloorModal from "../floors/CreateEditFloorModal.vue";
import { useProjectStore } from "@/src/stores/useProject";
import { useBlocksStore } from "@/src/stores/useBlock";
import CreateEditBlockModal from "../blocks/CreateEditBlockModal.vue";
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

const projectStore = useProjectStore();
const floorsStore = useFloorsStore();
const blocksStore = useBlocksStore();
const flatStore = useFlatsStore();

const showEditModal = ref<"flat" | "floor" | "block" | "">("");
const activeFlat = ref<FlatItem>();

const duplicatedBlock = ref<BlockItem | null>(null);
const duplicatedFloor = ref<FloorItem | null>(null);
const duplicatedFlat = ref<FlatItem | null>(null);

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

const editOrDuplicateModal = (item: PolygonDataCollection, duplicate: boolean = false) => {
  switch (item.type) {
    case "floor": {
      const activeFloor = floorsStore.projectFloors?.find((floor) => floor.id === item.id);

      if (!activeFloor) return;

      if (duplicate) {
        duplicatedFloor.value = activeFloor;
      } else {
        floorsStore.setActiveFloor(activeFloor);
      }

      showEditModal.value = "floor";

      break;
    }
    case "block": {
      const activeBlock = blocksStore.projectBlocks?.find((block) => block.id === item.id);

      if (!activeBlock) return;

      if (duplicate) {
        duplicatedBlock.value = activeBlock;
      } else {
        blocksStore.setActiveBlock(activeBlock);
      }
      showEditModal.value = "block";
      break;
    }
    case "flat": {
      const findedActiveFlat = flatStore.projectFlats?.find((flat) => flat.id === item.id);

      if (!findedActiveFlat) return;

      if (duplicate) {
        duplicatedFlat.value = findedActiveFlat;
      } else {
        activeFlat.value = findedActiveFlat;
      }
      showEditModal.value = "flat";
      break;
    }
    default:
      break;
  }
};

const editPolygon = (item: PolygonDataCollection) => {
  editOrDuplicateModal(item);
};

const duplicateAction = (item: PolygonDataCollection) => {
  editOrDuplicateModal(item, true);
};

watch(
  () => showEditModal.value,
  (_, os) => {
    const id = Number(projectStore?.id);

    if (os === "floor") {
      floorsStore.fetchProjectFloors(id);
    } else if (os === "flat") {
      flatStore.fetchProjectFlats(id);
    }
  }
);
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

    <div class="flex max-h-full flex-col gap-[1px] overflow-y-auto py-2">
      <div
        v-if="polygon_data"
        v-for="item in Object.values(polygon_data)"
        :key="item.key"
        class="group flex w-full min-w-60 cursor-pointer items-center justify-between gap-5 px-3 py-3 transition-colors hover:bg-white/90 hover:ring-1 hover:ring-primary"
        :class="{
          'bg-white/90 ring-1 ring-primary': item.key === activeGroup?.getAttribute('id')
        }"
        @click="setActiveG(item)"
      >
        <div class="flex items-center gap-1 text-sm">
          <p>shape |</p>
          <span v-if="item.type"> {{ item.type }} id: {{ item.id }} </span>
          <span v-else>#{{ item.key?.slice(0, 6) }}</span>
        </div>

        <div class="flex">
          <template v-if="item.id">
            <div class="sidebar-item-icon icon-hover-text" @click="unlink(item.key)" title="unlink">
              <Unlink />
            </div>

            <div class="sidebar-item-icon icon-hover-text" @click.stop="editPolygon(item)" title="edit">
              <Edit />
            </div>
          </template>

          <div class="sidebar-item-icon icon-hover-text" @click.stop="deleteG(item)" title="delete">
            <Delete />
          </div>

          <div class="sidebar-item-icon icon-hover-text" @click="duplicateAction(item)">
            <Eye />
          </div>
        </div>
      </div>
    </div>

    <teleport to="#my-vue-app">
      <Transition name="fade">
        <Modal v-if="showEditModal === 'floor'" @close="showEditModal = ''" type="2" width="w-11/12">
          <CreateEditFloorModal :duplicatedFloor="duplicatedFloor" />
        </Modal>
      </Transition>

      <Transition name="fade">
        <Modal v-if="showEditModal === 'block'" @close="showEditModal = ''" type="2" width="w-11/12">
          <CreateEditBlockModal :duplicatedBlock="duplicatedBlock" />
        </Modal>
      </Transition>

      <Transition name="fade">
        <Modal v-if="showEditModal === 'flat' && activeFlat" @close="showEditModal = ''" type="2" width="w-[400px]">
          <CreateEditFlatModal :activeFlat="activeFlat" :duplicatedFlat="duplicatedFlat" />
        </Modal>
      </Transition>
    </teleport>
  </div>
</template>
