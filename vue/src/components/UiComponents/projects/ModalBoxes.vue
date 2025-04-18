<script setup lang="ts">
import { ref, watch } from "vue";
import FloorsList from "../floors/FloorsList.vue";
import Building from "../icons/Building.vue";
import Flat from "../icons/Flat.vue";
import Floor from "../icons/floor.vue";
import Stack from "../icons/Stack.vue";
import Modal from "../Modal.vue";
import FlatsList from "../flats/FlatsList.vue";
import TypesList from "../types/TypesList.vue";
import { useTypesStore } from "@/src/stores/useTypes";
import { useProjectStore } from "@/src/stores/useProject";
import { useFloorsStore } from "@/src/stores/useFloors";
import { useFlatsStore } from "@/src/stores/useFlats";
import BlocksList from "../blocks/BlocksList.vue";
import FlagIcon from "../icons/FlagIcon.vue";
import ActionList from "../tooltip/ActionList.vue";
import { useBlocksStore } from "@/src/stores/useBlock";
import { useActionsStore } from "@/src/stores/useActions";

const showModal = ref<"tooltip" | "block" | "floor" | "flat" | "type" | "">("");

const actionsStore = useActionsStore();
const projectStore = useProjectStore();
const blocksStore = useBlocksStore();
const floorStore = useFloorsStore();
const typesStore = useTypesStore();
const flatStore = useFlatsStore();

watch(
  () => showModal.value,
  (_, os) => {
    const id = Number(projectStore?.id);

    if (os === "tooltip") {
      actionsStore.fetchProjectActions(id);
    } else if (os === "block") {
      blocksStore.fetchProjectBLocks(id);
    } else if (os === "type") {
      typesStore.fetchProjectTypes(id);
    } else if (os === "floor") {
      floorStore.fetchProjectFloors(id);
    } else if (os === "flat") {
      flatStore.fetchProjectFlats(id);
    }
  }
);
</script>

<template>
  <div class="flex w-full items-center gap-3">
    <div class="modal-box-item" @click="showModal = 'tooltip'">
      <FlagIcon />
      <div>
        <h4 class="font-semibold">Action</h4>
        <p>{{ actionsStore.projectActions?.length || 0 }} actions</p>
      </div>
    </div>

    <div class="modal-box-item" @click="showModal = 'block'">
      <Building />
      <div>
        <h4 class="font-semibold">Blocks</h4>
        <p>{{ blocksStore.projectBlocks?.length || 0 }} block</p>
      </div>
    </div>

    <div class="modal-box-item" @click="showModal = 'floor'">
      <Floor />
      <div>
        <h4 class="font-semibold">Floors</h4>
        <p>{{ floorStore.projectFloors?.length || 0 }} floor</p>
      </div>
    </div>

    <div class="modal-box-item" @click="showModal = 'flat'">
      <Flat />
      <div>
        <h4 class="font-semibold">Flats</h4>
        <p>{{ flatStore.projectFlats?.length || 0 }} flat</p>
      </div>
    </div>

    <div class="modal-box-item" @click="showModal = 'type'">
      <Stack />
      <div>
        <h4 class="font-semibold">Types</h4>
        <p>{{ typesStore.projectTypes?.length || 0 }} type</p>
      </div>
    </div>

    <teleport to="#irep-vue-app">
      <Transition name="fade">
        <Modal :show="showModal === 'tooltip'" type="2" width="w-11/12" @close="showModal = ''">
          <ActionList />
        </Modal>
      </Transition>
    </teleport>

    <teleport to="#irep-vue-app">
      <!-- <Transition name="fade"> -->
      <Modal :show="showModal === 'floor'" type="2" width="w-11/12" @close="showModal = ''">
        <FloorsList />
      </Modal>
      <!-- </Transition> -->
    </teleport>

    <teleport to="#irep-vue-app">
      <Transition name="fade">
        <Modal :show="showModal === 'block'" type="2" width="w-11/12" @close="showModal = ''">
          <BlocksList />
        </Modal>
      </Transition>
    </teleport>

    <teleport to="#irep-vue-app">
      <Transition name="fade">
        <Modal :show="showModal === 'flat'" type="2" width="w-11/12" @close="showModal = ''">
          <FlatsList />
        </Modal>
      </Transition>
    </teleport>

    <teleport to="#irep-vue-app">
      <Transition name="fade">
        <Modal :show="showModal === 'type'" type="2" width="w-11/12" @close="showModal = ''">
          <TypesList />
        </Modal>
      </Transition>
    </teleport>
  </div>
</template>

<style>
.modal-box-item {
  @apply flex flex-1 cursor-pointer items-center gap-3 rounded-md border bg-white px-4 py-5 ring-primary transition-all hover:bg-gray-100 hover:ring-1 [&_path]:fill-gray-700 [&_svg]:h-[40px] [&_svg]:w-[40px];
}
</style>
