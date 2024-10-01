<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "vue-toast-notification";
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import UploadImg from "../form/UploadImg.vue";
import { FloorItem, imageInterface, PolygonDataCollection } from "@/types/components";
import { useFloorsStore } from "@/src/stores/useFloors";
import Canvas from "../../Canvas.vue";
import { resetCanvasAfterSave, transformSvgString } from "@/src/composables/helpers";
import Input from "../form/Input.vue";
import Select from "../form/Select.vue";
import Button from "../form/Button.vue";
import Modal from "../Modal.vue";
import CreateEditFlatModal from "../flats/CreateEditFlatModal.vue";
import { useFlatsStore } from "@/src/stores/useFlats";
import { useBlocksStore } from "@/src/stores/useBlock";

const props = defineProps<{
  duplicatedFloor?: FloorItem | null;
}>();

const defaultConf = [
  { title: "Reserved", value: "reserved" },
  { title: "Sold", value: "sold" }
];

const projectStore = useProjectStore();
const floorStore = useFloorsStore();
const flatStore = useFlatsStore();
const blockStore = useBlocksStore();
const { id, svgRef } = storeToRefs(projectStore);
const { activeFloor, activeGroup, floorSvgRef } = storeToRefs(floorStore);
const addFlatModal = ref(false);

const deleteG = (key: string) => {
  activeGroup.value = null;
  floorStore.removePoligonItem(key);
  floorSvgRef.value?.querySelector(`#${key}`)?.remove();
};

const $toast = useToast();

const title = ref("");
const floor_number = ref();
const floor_image = ref<imageInterface[] | null>(null);
const conf = ref({ title: "Choose", value: "" });
const block = ref();
const duplicatedFloorPolygonData = ref<PolygonDataCollection[]>();
const img_contain = ref(false);

const blockSelectData = computed(() => {
  return (
    blockStore.projectBlocks?.map((block) => {
      return {
        title: block?.title,
        value: block.id
      };
    }) || []
  );
});

const submitForm = async () => {
  if (floorSvgRef.value) {
    await resetCanvasAfterSave(floorSvgRef.value);
  }
  if (svgRef.value) {
    await resetCanvasAfterSave(svgRef.value);
  }

  activeGroup.value = null;

  if (activeFloor.value) {
    updateFloor();
  } else {
    createFloor();
  }
};

const updateFloor = async () => {
  const params: any = {
    title: title.value,
    floor_number: floor_number.value,
    floor_image: floor_image.value?.[0]?.id,
    conf: conf.value?.value,
    floor_id: activeFloor.value?.id,
    polygon_data: activeFloor.value?.polygon_data,
    svg: floorSvgRef.value?.querySelector("svg")?.outerHTML || "",
    img_contain: img_contain.value,
    block_id: block.value?.value
  };

  const { data } = await ajaxAxios.post("", {
    action: "update_floor",
    nonce: irePlugin.nonce,
    ...params
  });

  if (data.success) {
    $toast.success("Floor Updated!", {
      position: "top"
    });

    activeGroup.value = null;

    if (floor_image.value?.[0] && activeFloor.value) {
      activeFloor.value.floor_image = floor_image.value;
      floor_image.value = null;
    }
  } else {
    $toast.error(data?.data || "Something went wrong!", {
      position: "top"
    });
  }
};

const createFloor = async () => {
  const params: any = {
    title: title.value,
    floor_number: floor_number.value,
    floor_image: floor_image.value?.[0]?.id || props.duplicatedFloor?.floor_image?.[0]?.id,
    conf: conf.value?.value,
    project_id: id.value,
    img_contain: img_contain.value
  };

  if (block.value?.value) {
    params.block_id = block.value?.value;
  }

  if (duplicatedFloorPolygonData.value) {
    params.polygon_data = duplicatedFloorPolygonData.value;
    params.svg = floorSvgRef.value?.querySelector("svg")?.outerHTML || "";
  }

  try {
    const { data } = await ajaxAxios.post("", {
      action: "create_floor",
      nonce: irePlugin.nonce,
      ...params
    });

    if (data.success) {
      $toast.success("Floor created!", {
        position: "top"
      });

      floorStore.setActiveFloor(data.data);
      floor_image.value = null;
    } else {
      $toast.error(data?.data || "Something went wrong!", {
        position: "top"
      });
    }
  } catch (error) {
    $toast.error("Something went wrong!", {
      position: "top"
    });
  }
};

watch(
  () => addFlatModal.value,
  (ns) => {
    if (!ns) {
      flatStore.fetchProjectFlats(id.value);
    }
  }
);

const sedDefaultValues = (source: FloorItem) => {
  title.value = source.title;
  floor_number.value = source.floor_number;
  conf.value = defaultConf.find((item) => item.value === source.conf) || { title: "choose", value: "" };
  block.value = blockSelectData.value.find((item) => item.value === source.block_id?.toString()) || {
    title: "choose",
    value: ""
  };
  floor_image.value = source.floor_image;
  img_contain.value = source.img_contain;
};

onMounted(() => {
  if (activeFloor.value) {
    sedDefaultValues(activeFloor.value);
  } else if (props.duplicatedFloor) {
    sedDefaultValues(props.duplicatedFloor);

    const polygonData = props.duplicatedFloor?.polygon_data;

    duplicatedFloorPolygonData.value = polygonData
      ? polygonData.map((item) => {
          return {
            id: "",
            key: item.key,
            type: ""
          };
        })
      : [];
  }
});

onUnmounted(() => {
  activeGroup.value = null;
  activeFloor.value = null;

  if (svgRef.value) {
    resetCanvasAfterSave(svgRef.value);
  }
});
</script>

<template>
  <div class="mt-14 flex gap-5">
    <div class="h-fit flex-1">
      <Canvas
        v-if="activeFloor"
        :projectImage="activeFloor?.floor_image?.[0].url"
        :polygon_data="activeFloor?.polygon_data"
        :svgRef="floorSvgRef"
        :svg="activeFloor.svg"
        :activeGroup="activeGroup"
        :isFloorsCanvas="true"
        :isImageContain="img_contain"
        @set-svg-ref="(svgContainer) => (floorSvgRef = svgContainer)"
        @set-active-g="(gTag) => (activeGroup = gTag)"
        @delete-g="(key) => deleteG(key)"
        @add-polygon-data="(key) => floorStore.addPolygonData(key)"
        @update-polygon-data="(key, data) => floorStore.editpoligonData(key, data)"
      />
      <Canvas
        v-else-if="duplicatedFloor"
        :projectImage="duplicatedFloor?.floor_image?.[0].url"
        :polygon_data="duplicatedFloorPolygonData"
        :svgRef="floorSvgRef"
        :svg="transformSvgString(duplicatedFloor.svg)"
        :activeGroup="activeGroup"
        :isFloorsCanvas="true"
        :isImageContain="img_contain"
        @set-svg-ref="(svgContainer) => (floorSvgRef = svgContainer)"
        @set-active-g="(gTag) => (activeGroup = gTag)"
        @delete-g="(key) => deleteG(key)"
        @add-polygon-data="(key) => duplicatedFloorPolygonData?.push({ id: '', key, type: '' })"
      />
    </div>

    <div class="flex flex-col gap-10">
      <form class="h-fit w-60 rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
        <div class="flex w-full items-center justify-center bg-gray-50 p-3">
          <h2 class="text-lg">
            {{ activeFloor ? "Editing floor with ID - " : "Add floor" }}

            <span v-if="activeFloor" class="text-red-500"> {{ activeFloor?.id }} </span>
          </h2>
        </div>

        <div class="flex flex-col items-center gap-3 p-3">
          <Input v-model="title" placeholder="Floor title" label="title" />
          <Input v-model="floor_number" placeholder="Floor number" label="floor number" type="number" required />

          <Select v-model="block" :data="blockSelectData" label="select block" clearable />

          <Select v-model="conf" :data="defaultConf" label="select conf" clearable />

          <div class="flex w-full items-center justify-between gap-2">
            <div>
              <p class="font-semibold">object-fit: contain</p>
              <p class="mb-1 text-xs italic text-gray-500">default is cover</p>
            </div>
            <input type="checkbox" v-model="img_contain" />
          </div>

          <UploadImg v-model="floor_image" title="Upload floor image" required />

          <Button type="submit" :title="activeFloor ? 'Edit floor' : 'Add floor'" />
        </div>
      </form>
      <Button title="Add flat" @click="addFlatModal = true" :outlined="true" />
    </div>
  </div>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="addFlatModal" @close="addFlatModal = false" type="2" width="w-[400px]">
        <CreateEditFlatModal :activeFlat="null" />
      </Modal>
    </Transition>
  </teleport>
</template>
