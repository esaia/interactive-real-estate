<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "vue-toast-notification";
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import UploadImg from "../form/UploadImg.vue";
import { BlockItem, imageInterface, PolygonDataCollection } from "@/types/components";
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
  duplicatedBlock?: BlockItem | null;
}>();

const defaultConf = [
  { title: "Reserved", value: "reserved" },
  { title: "Sold", value: "sold" }
];

const projectStore = useProjectStore();
const blockStore = useBlocksStore();
const flatStore = useFlatsStore();
const { id, svgRef } = storeToRefs(projectStore);
const { activeBlock, activeBlockGroup, blockSvgRef } = storeToRefs(blockStore);
const addFlatModal = ref(false);

const deleteG = (key: string) => {
  activeBlockGroup.value = null;
  blockStore.removePoligonItem(key);
  blockSvgRef.value?.querySelector(`#${key}`)?.remove();
};

const $toast = useToast();

const title = ref("");
const block_image = ref<imageInterface[] | null>(null);
const conf = ref({ title: "Choose", value: "" });
const duplicatedFloorPolygonData = ref<PolygonDataCollection[]>();
const img_contain = ref(false);

const submitForm = async () => {
  if (blockSvgRef.value) {
    await resetCanvasAfterSave(blockSvgRef.value);
  }
  if (svgRef.value) {
    await resetCanvasAfterSave(svgRef.value);
  }

  activeBlockGroup.value = null;

  if (activeBlock.value) {
    await updateBlcok();
  } else {
    createBlock();
  }
};

const updateBlcok = async () => {
  const params = {
    block_id: activeBlock.value?.id,
    title: title.value,
    block_image: block_image.value?.[0]?.id,
    conf: conf.value.value,
    polygon_data: activeBlock.value?.polygon_data,
    svg: blockSvgRef.value?.querySelector("svg")?.outerHTML || "",
    img_contain: img_contain.value
  };

  const { data } = await ajaxAxios.post("", {
    action: "update_block",
    nonce: irePlugin.nonce,
    ...params
  });

  if (data.success) {
    $toast.success("Block Updated!", {
      position: "top"
    });

    activeBlockGroup.value = null;

    if (block_image.value?.[0] && activeBlock.value) {
      activeBlock.value.block_image = block_image.value;
      block_image.value = null;
    }
  } else {
    $toast.error(data?.data || "Something went wrong!", {
      position: "top"
    });
  }
};

const createBlock = async () => {
  const params: any = {
    title: title.value,
    block_image: block_image.value?.[0]?.id || props.duplicatedBlock?.block_image?.[0]?.id,
    conf: conf.value.value,
    project_id: id.value,
    img_contain: img_contain.value
  };

  if (duplicatedFloorPolygonData.value) {
    params.polygon_data = duplicatedFloorPolygonData.value;
    params.svg = blockSvgRef.value?.querySelector("svg")?.outerHTML || "";
  }

  try {
    const { data } = await ajaxAxios.post("", {
      action: "create_block",
      nonce: irePlugin.nonce,
      ...params
    });

    if (data.success) {
      $toast.success("Block created!", {
        position: "top"
      });

      blockStore.setActiveBlock(data.data);
      block_image.value = null;
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

onMounted(() => {
  if (activeBlock.value) {
    title.value = activeBlock.value.title;
    conf.value = defaultConf.find((item) => item.value === activeBlock.value?.conf) || {
      title: "choose",
      value: ""
    };
    block_image.value = activeBlock.value.block_image;
    img_contain.value = activeBlock.value.img_contain;
  } else if (props.duplicatedBlock) {
    title.value = props.duplicatedBlock.title;
    conf.value = defaultConf.find((item) => item.value === props.duplicatedBlock?.conf) || {
      title: "choose",
      value: ""
    };
    block_image.value = props.duplicatedBlock.block_image;
    img_contain.value = props.duplicatedBlock.img_contain;
    const polygonData = props.duplicatedBlock?.polygon_data;

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
  if (svgRef.value) {
    resetCanvasAfterSave(svgRef.value);
  }
});
</script>

<template>
  <div class="mt-14 flex gap-5">
    <div class="h-fit flex-1">
      <Canvas
        v-if="activeBlock"
        :projectImage="activeBlock?.block_image?.[0].url"
        :polygon_data="activeBlock?.polygon_data"
        :svgRef="blockSvgRef"
        :svg="activeBlock.svg"
        :activeGroup="activeBlockGroup"
        :isFloorsCanvas="false"
        isBlockCanvas
        :isImageContain="img_contain"
        @set-svg-ref="(svgContainer) => (blockSvgRef = svgContainer)"
        @set-active-g="(gTag) => (activeBlockGroup = gTag)"
        @delete-g="(key) => deleteG(key)"
        @add-polygon-data="(key) => blockStore.addPolygonData(key)"
        @update-polygon-data="(key, data) => blockStore.editpoligonData(key, data)"
      />
      <Canvas
        v-else-if="duplicatedBlock"
        :projectImage="duplicatedBlock?.block_image?.[0].url"
        :polygon_data="duplicatedFloorPolygonData"
        :svgRef="blockSvgRef"
        :svg="transformSvgString(duplicatedBlock.svg)"
        :activeGroup="activeBlockGroup"
        :isFloorsCanvas="false"
        isBlockCanvas
        :isImageContain="img_contain"
        @set-svg-ref="(svgContainer) => (blockSvgRef = svgContainer)"
        @set-active-g="(gTag) => (activeBlockGroup = gTag)"
        @delete-g="(key) => deleteG(key)"
        @add-polygon-data="(key) => duplicatedFloorPolygonData?.push({ id: '', key, type: '' })"
      />
    </div>

    <div class="flex flex-col gap-10">
      <form class="h-fit w-60 rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
        <div class="flex w-full items-center justify-center bg-gray-50 p-3">
          <h2 class="text-lg">
            {{ activeBlock ? "Editing block with ID - " : "Add Block" }}

            <span v-if="activeBlock" class="text-red-500"> {{ activeBlock?.id }} </span>
          </h2>
        </div>

        <div class="flex flex-col items-center gap-3 p-3">
          <Input v-model="title" placeholder="Floor title" label="title" required />

          <Select v-model="conf" :data="defaultConf" label="select conf" clearable />

          <div class="flex w-full items-center justify-between gap-2">
            <div>
              <p class="font-semibold">object-fit: contain</p>
              <p class="mb-1 text-xs italic text-gray-500">default is cover</p>
            </div>
            <input type="checkbox" v-model="img_contain" />
          </div>

          <UploadImg v-model="block_image" title="Upload floor image" required />

          <Button type="submit" :title="activeBlock ? 'Edit block' : 'Add block'" />
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
