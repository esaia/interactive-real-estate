<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import UploadImg from "../form/UploadImg.vue";
import { BlockItem, imageInterface, PolygonDataCollection } from "@/types/components";
import Canvas from "../../Canvas.vue";
import { resetCanvasAfterSave, showToast, irep_transformSvgString, toBase64 } from "@/src/composables/helpers";
import Input from "../form/Input.vue";
import Select from "../form/Select.vue";
import Button from "../form/Button.vue";
import { useBlocksStore } from "@/src/stores/useBlock";
import FloorsList from "../floors/FloorsList.vue";

const props = defineProps<{
  duplicatedBlock?: BlockItem | null;
}>();

const defaultConf = [
  { title: "Reserved", value: "reserved" },
  { title: "Sold", value: "sold" }
];

const projectStore = useProjectStore();
const blockStore = useBlocksStore();

const { id, svgRef } = storeToRefs(projectStore);
const { activeBlock, activeBlockGroup, blockSvgRef } = storeToRefs(blockStore);

const title = ref("");
const block_image = ref<imageInterface[] | null>(null);
const conf = ref({ title: "Choose", value: "" });
const duplicatedFloorPolygonData = ref<PolygonDataCollection[]>();
const loading = ref(false);

const defaultBlockId = computed(() => {
  if (activeBlock.value) {
    return activeBlock.value?.id;
  } else if (props.duplicatedBlock) {
    return props.duplicatedBlock?.id;
  }
});

const deleteG = (key: string) => {
  activeBlockGroup.value = null;
  blockStore.removePoligonItem(key);
  blockSvgRef.value?.querySelector(`#${key}`)?.remove();
};

const submitForm = async () => {
  if (blockSvgRef.value) {
    await resetCanvasAfterSave(blockSvgRef.value);
  }
  if (svgRef.value) {
    await resetCanvasAfterSave(svgRef.value);
  }

  activeBlockGroup.value = null;
  loading.value = true;

  if (activeBlock.value) {
    try {
      await updateBlock();
    } catch (error) {
      showToast("error", "Something went wrong!");
    }
  } else {
    try {
      await createBlock();
    } catch (error) {
      showToast("error", "Something went wrong!");
    }
  }

  loading.value = false;
};

const updateBlock = async () => {
  const svgElement = blockSvgRef.value?.querySelector("svg");

  const svgBase64 = await toBase64(svgElement);

  const params = {
    block_id: activeBlock.value?.id,
    title: title.value,
    block_image: block_image.value?.[0]?.id || activeBlock.value?.block_image[0]?.id,
    conf: conf.value?.value,
    polygon_data: activeBlock.value?.polygon_data,
    svg: svgBase64
  };

  const { data } = await ajaxAxios.post("", {
    action: "irep_update_block",
    nonce: irePlugin.nonce,
    ...params
  });

  if (data.success) {
    showToast("success", "Block Updated!");

    activeBlockGroup.value = null;

    if (block_image.value?.[0] && activeBlock.value) {
      activeBlock.value.block_image = block_image.value;
      block_image.value = null;
    }
  } else {
    showToast("error", data?.data || "Something went wrong!");
  }
};

const createBlock = async () => {
  const params: any = {
    title: title.value,
    block_image: block_image?.value?.[0]?.id || props.duplicatedBlock?.block_image?.[0]?.id,
    conf: conf.value?.value,
    project_id: id.value
  };

  if (duplicatedFloorPolygonData.value) {
    params.polygon_data = duplicatedFloorPolygonData.value;

    const svgElement = blockSvgRef.value?.querySelector("svg");
    const svgBase64 = await toBase64(svgElement);
    params.svg = svgBase64;
  }

  try {
    const { data } = await ajaxAxios.post("", {
      action: "irep_create_block",
      nonce: irePlugin.nonce,
      ...params
    });

    if (data.success) {
      showToast("success", "Block created!");

      blockStore.setActiveBlock(data.data);
      block_image.value = null;
    } else {
      showToast("error", data?.data || "Something went wrong!");
    }
  } catch (error) {
    showToast("error", "Something went wrong!");
  }
};

onMounted(() => {
  if (activeBlock.value) {
    title.value = activeBlock.value.title;
    conf.value = defaultConf.find((item) => item.value === activeBlock.value?.conf) || {
      title: "choose",
      value: ""
    };
    block_image.value = activeBlock.value.block_image;
  } else if (props.duplicatedBlock) {
    title.value = props.duplicatedBlock.title;
    conf.value = defaultConf.find((item) => item.value === props.duplicatedBlock?.conf) || {
      title: "choose",
      value: ""
    };

    block_image.value = props.duplicatedBlock.block_image;
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
  activeBlockGroup.value = null;
  activeBlock.value = null;
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
        @set-svg-ref="(svgContainer: any) => (blockSvgRef = svgContainer)"
        @set-active-g="(gTag: any) => (activeBlockGroup = gTag)"
        @delete-g="(key: any) => deleteG(key)"
        @add-polygon-data="(key: any) => blockStore.addPolygonData(key)"
        @update-polygon-data="(key: any, data: any) => blockStore.editpoligonData(key, data)"
      />
      <Canvas
        v-else-if="duplicatedBlock"
        :projectImage="duplicatedBlock?.block_image?.[0].url"
        :polygon_data="duplicatedFloorPolygonData"
        :svgRef="blockSvgRef"
        :svg="irep_transformSvgString(duplicatedBlock.svg)"
        :activeGroup="activeBlockGroup"
        :isFloorsCanvas="false"
        isBlockCanvas
        @set-svg-ref="(svgContainer: any) => (blockSvgRef = svgContainer)"
        @set-active-g="(gTag: any) => (activeBlockGroup = gTag)"
        @delete-g="(key: any) => deleteG(key)"
        @add-polygon-data="(key: any) => duplicatedFloorPolygonData?.push({ id: '', key, type: '' })"
      />

      <FloorsList v-if="activeBlock" :default-block-id="defaultBlockId" />
    </div>

    <div class="flex flex-col gap-10">
      <form class="sticky top-14 h-fit w-60 rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
        <div class="flex w-full items-center justify-center bg-gray-50 p-3">
          <h2 class="!text-lg">
            {{ activeBlock ? "Editing block with ID - " : "Add Block" }}

            <span v-if="activeBlock" class="text-red-500"> {{ activeBlock?.id }} </span>
          </h2>
        </div>

        <div class="flex flex-col items-center gap-3 p-3">
          <Input v-model="title" placeholder="Block A" label="Block title" required />

          <Select v-model="conf" :data="defaultConf" label="configuration" clearable />

          <UploadImg
            v-model="block_image"
            title="Upload block image"
            :example-image="irePlugin?.plugin_assets_path + 'exampleImages/block.jpg'"
            required
          />

          <p v-if="activeBlock" class="mt-2 text-red-700">
            <span class="font-semibold">IMPORTANT:</span> Changing the image may cause svg paths mismatches.
          </p>

          <Button type="submit" :title="activeBlock ? 'Edit block' : 'Add block'" :loading="loading" />
        </div>
      </form>
    </div>
  </div>
</template>
