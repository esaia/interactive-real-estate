<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import UploadImg from "../form/UploadImg.vue";
import { FloorItem, imageInterface, PolygonDataCollection } from "@/types/components";
import { useFloorsStore } from "@/src/stores/useFloors";
import Canvas from "../../Canvas.vue";
import { resetCanvasAfterSave, showToast, irep_transformSvgString } from "@/src/composables/helpers";
import Input from "../form/Input.vue";
import Select from "../form/Select.vue";
import Button from "../form/Button.vue";
import { useBlocksStore } from "@/src/stores/useBlock";
import FlatsList from "../flats/FlatsList.vue";

const props = defineProps<{
  duplicatedFloor?: FloorItem | null;
}>();

const defaultConf = [
  { title: "Reserved", value: "reserved" },
  { title: "Sold", value: "sold" }
];

const projectStore = useProjectStore();
const floorStore = useFloorsStore();
const blockStore = useBlocksStore();
const { activeBlock } = storeToRefs(blockStore);
const { id, svgRef } = storeToRefs(projectStore);
const { activeFloor, activeGroup, floorSvgRef } = storeToRefs(floorStore);

const title = ref("");
const floor_number = ref();
const floor_image = ref<imageInterface[] | null>(null);
const conf = ref({ title: "Choose", value: "" });
const block = ref();
const duplicatedFloorPolygonData = ref<PolygonDataCollection[]>();

const defaultBlockId = computed(() => {
  if (activeBlock.value) {
    return activeBlock.value?.id;
  } else if (activeFloor.value?.block_id) {
    return activeFloor.value?.block_id.toString();
  } else {
    return "null";
  }
});

const defaultFloorId = computed(() => {
  if (activeFloor.value) {
    return activeFloor.value?.floor_number.toString();
  } else if (props.duplicatedFloor) {
    return props.duplicatedFloor?.floor_number.toString();
  }
});

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

const deleteG = (key: string) => {
  activeGroup.value = null;
  floorStore.removePoligonItem(key);
  floorSvgRef.value?.querySelector(`#${key}`)?.remove();
};

const submitForm = async () => {
  if (floorSvgRef.value) {
    resetCanvasAfterSave(floorSvgRef.value);
  }
  if (svgRef.value) {
    resetCanvasAfterSave(svgRef.value);
  }

  activeGroup.value = null;

  if (activeFloor.value) {
    await updateFloor();
  } else {
    await createFloor();
  }

  floorStore.fetchProjectFloors(id.value);
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
    block_id: block.value?.value
  };

  const { data } = await ajaxAxios.post("", {
    action: "irep_update_floor",
    nonce: irePlugin.nonce,
    ...params
  });

  if (data.success) {
    showToast("success", "Floor Updated!");

    activeGroup.value = null;

    if (floor_image.value?.[0] && activeFloor.value) {
      activeFloor.value.floor_image = floor_image.value;
      floor_image.value = null;
    }
  } else {
    showToast("error", data?.data || "Something went wrong!");
  }
};

const createFloor = async () => {
  const params: any = {
    title: title.value,
    floor_number: floor_number.value,
    floor_image: floor_image.value?.[0]?.id || props.duplicatedFloor?.floor_image?.[0]?.id,
    conf: conf.value?.value,
    project_id: id.value
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
      action: "irep_create_floor",
      nonce: irePlugin.nonce,
      ...params
    });

    if (data.success) {
      showToast("success", "Floor created!");

      floorStore.setActiveFloor(data.data);
      floor_image.value = null;
    } else {
      showToast("error", data?.data || "Something went wrong!");
    }
  } catch (error) {
    showToast("error", "Something went wrong!");
  }
};

const sedDefaultValues = (source: FloorItem) => {
  title.value = source.title;
  floor_number.value = source.floor_number;
  conf.value = defaultConf.find((item) => item.value === source.conf) || { title: "choose", value: "" };
  block.value = blockSelectData.value.find((item) => item.value === source.block_id?.toString()) || {
    title: "choose",
    value: ""
  };
  floor_image.value = source.floor_image;
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
  floorStore.fetchProjectFloors(projectStore.id);

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
        :projectImage="activeFloor?.floor_image?.[0]?.url"
        :polygon_data="activeFloor?.polygon_data"
        :svgRef="floorSvgRef"
        :svg="activeFloor.svg"
        :activeGroup="activeGroup"
        :isFloorsCanvas="true"
        @set-svg-ref="(svgContainer: any) => (floorSvgRef = svgContainer)"
        @set-active-g="(gTag: any) => (activeGroup = gTag)"
        @delete-g="(key: any) => deleteG(key)"
        @add-polygon-data="(key: any) => floorStore.addPolygonData(key)"
        @update-polygon-data="(key: any, data: any) => floorStore.editpoligonData(key, data)"
      />
      <Canvas
        v-else-if="duplicatedFloor"
        :projectImage="duplicatedFloor?.floor_image?.[0]?.url"
        :polygon_data="duplicatedFloorPolygonData"
        :svgRef="floorSvgRef"
        :svg="irep_transformSvgString(duplicatedFloor.svg)"
        :activeGroup="activeGroup"
        :isFloorsCanvas="true"
        @set-svg-ref="(svgContainer: any) => (floorSvgRef = svgContainer)"
        @set-active-g="(gTag: any) => (activeGroup = gTag)"
        @delete-g="(key: any) => deleteG(key)"
        @add-polygon-data="(key: any) => duplicatedFloorPolygonData?.push({ id: '', key, type: '' })"
      />

      <FlatsList v-if="activeFloor" :default-floor="defaultFloorId" :default-block="defaultBlockId" />
    </div>

    <div class="flex flex-col gap-10">
      <form class="sticky top-14 h-fit w-60 rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
        <div class="flex w-full items-center justify-center bg-gray-50 p-3">
          <h2 class="!text-lg">
            {{ activeFloor ? "Editing floor with ID - " : "Add floor" }}

            <span v-if="activeFloor" class="text-red-500"> {{ activeFloor?.id }} </span>
          </h2>
        </div>

        <div class="flex flex-col items-center gap-3 p-3">
          <Input v-model="title" placeholder="Floor 2" label="title" />
          <Input v-model="floor_number" placeholder="2" label="floor number" type="number" required />

          <Select v-model="block" :data="blockSelectData" label="select block" clearable />

          <Select v-model="conf" :data="defaultConf" label="configuration" clearable />

          <UploadImg
            v-model="floor_image"
            title="Upload floor image"
            :example-image="irePlugin?.plugin_assets_path + 'exampleImages/floor_3d.jpg'"
            required
          />

          <Button type="submit" :title="activeFloor ? 'Edit floor' : 'Add floor'" />
        </div>
      </form>
    </div>
  </div>
</template>
