<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import Collapse from "../icons/Collapse.vue";
import Edit from "../icons/Edit.vue";
import { ActionItem, FlatItem, PolygonDataCollection } from "../../../../types/components";
import Info from "../icons/Info.vue";
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
import CreateEditActionModal from "../tooltip/CreateEditActionModal.vue";
import { useActionsStore } from "@/src/stores/useActions";
import RightClick from "../icons/RightClick.vue";
import LeftClick from "../icons/LeftClick.vue";
import Esc from "../icons/Esc.vue";
import Ctrl from "../icons/Ctrl.vue";
import PlusBtn from "../icons/PlusBtn.vue";
import MinusBtn from "../icons/MinusBtn.vue";
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
const actionStore = useActionsStore();

const sidebarRef = ref<HTMLDivElement>();
const showEditModal = ref<"tooltip" | "flat" | "floor" | "block" | "">("");
const activeFlat = ref<FlatItem>();
const activeAction = ref<ActionItem>();
const showInfo = ref(false);

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

const editOrDuplicateModal = (item: PolygonDataCollection) => {
  switch (item.type) {
    case "floor": {
      const activeFloor = floorsStore.projectFloors?.find((floor) => floor.id === item.id);

      if (!activeFloor) return;

      floorsStore.setActiveFloor(activeFloor);

      showEditModal.value = "floor";

      break;
    }
    case "block": {
      const activeBlock = blocksStore.projectBlocks?.find((block) => block.id === item.id);

      if (!activeBlock) return;

      blocksStore.setActiveBlock(activeBlock);

      showEditModal.value = "block";
      break;
    }
    case "flat": {
      const findedActiveFlat = flatStore.projectFlats?.find((flat) => flat.id === item.id);

      if (!findedActiveFlat) return;

      activeFlat.value = findedActiveFlat;

      showEditModal.value = "flat";
      break;
    }
    case "tooltip": {
      const findedActiveAction = actionStore.projectActions?.find((action) => action.id === item.id);
      if (!findedActiveAction) return;
      activeAction.value = findedActiveAction;
      showEditModal.value = "tooltip";
      break;
    }
    default:
      break;
  }
};

const editPolygon = (item: PolygonDataCollection) => {
  editOrDuplicateModal(item);
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
watch(
  () => props.activeGroup,
  async (ns) => {
    await nextTick();

    const activeElement = sidebarRef.value?.querySelector(".active");

    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      });
    }

    // sidebarRef.value?.scrollTo({
    //   top: 400,
    //   behavior: "smooth"
    // });
  }
);
</script>

<template>
  <div>
    <div
      class="custom-scroll absolute left-0 top-0 flex h-full flex-col bg-white/70 transition-all duration-300 ease-out"
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
        <h3 class="!text-lg">Shapes:</h3>

        <div class="cursor-pointer" @mouseenter="showInfo = true" @mouseleave="showInfo = false">
          <Info />
        </div>
      </div>

      <div ref="sidebarRef" class="flex max-h-full flex-col gap-[1px] overflow-y-auto py-2">
        <div
          v-if="polygon_data"
          v-for="item in Object.values(polygon_data)"
          :key="item.key"
          class="group flex w-full min-w-60 cursor-pointer items-center justify-between gap-5 px-3 py-3 transition-colors hover:bg-white/90 hover:ring-1 hover:ring-primary"
          :class="{
            'active bg-white/90 ring-1 ring-primary': item.key === activeGroup?.getAttribute('id')
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
          </div>
        </div>
      </div>

      <teleport to="#ire-vue-app">
        <Transition name="fade">
          <Modal v-if="showEditModal === 'floor'" @close="showEditModal = ''" type="2" width="w-11/12">
            <CreateEditFloorModal />
          </Modal>
        </Transition>

        <Transition name="fade">
          <Modal v-if="showEditModal === 'block'" @close="showEditModal = ''" type="2" width="w-11/12">
            <CreateEditBlockModal />
          </Modal>
        </Transition>

        <Transition name="fade">
          <Modal v-if="showEditModal === 'flat' && activeFlat" @close="showEditModal = ''" type="2" width="w-[400px]">
            <CreateEditFlatModal :activeFlat="activeFlat" />
          </Modal>
        </Transition>
      </teleport>

      <teleport to="#ire-vue-app">
        <Transition name="fade">
          <Modal v-if="showEditModal === 'tooltip'" @close="showEditModal = ''" type="2" width="w-[500px]">
            <CreateEditActionModal :activeAction="activeAction || null" />
          </Modal>
        </Transition>
      </teleport>
    </div>

    <Transition name="fade-in-out">
      <div
        v-if="showInfo"
        class="absolute right-0 top-0 z-[999] flex h-full flex-col gap-8 bg-white/90 px-6 py-4 !text-gray-700 [&_svg]:h-8 [&_svg]:w-8"
      >
        <div class="info-item">
          <LeftClick />
          <span>-</span>
          <p>Start drawing</p>
        </div>

        <div class="info-item">
          <RightClick />
          <span>-</span>
          <p>Select item</p>
        </div>

        <div class="info-item">
          <Esc class="!h-7 !w-7" />
          <span>-</span>
          <p>Cancel drawing</p>
        </div>

        <div class="info-item">
          <div class="flex items-center gap-2">
            <Ctrl />
            <span>+</span>
            <PlusBtn class="!h-7 !w-7" />
          </div>

          <span>-</span>
          <p>Zoom in</p>
        </div>

        <div class="info-item">
          <div class="flex items-center gap-2">
            <Ctrl />
            <span>+</span>
            <MinusBtn class="!h-7 !w-7" />
          </div>

          <span>-</span>
          <p>Reset zoom</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
.info-item {
  @apply flex items-center gap-2 !text-lg;
}
</style>
