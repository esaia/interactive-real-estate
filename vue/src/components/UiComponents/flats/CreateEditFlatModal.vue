<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import Button from "../form/Button.vue";
import Input from "../form/Input.vue";
import Select from "../form/Select.vue";
import { useFloorsStore } from "@/src/stores/useFloors";
import { storeToRefs } from "pinia";
import { useTypesStore } from "@/src/stores/useTypes";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";
import { FlatItem, selectDataItem, TypeItem } from "@/types/components";
import CreateEditTypeModal from "../types/CreateEditTypeModal.vue";
import Modal from "../Modal.vue";
import { useBlocksStore } from "@/src/stores/useBlock";
import { pushToPlansPage, showToast } from "@/src/composables/helpers";
import { useFlatsStore } from "@/src/stores/useFlats";
import UploadImg from "../form/UploadImg.vue";
import Radio from "../form/Radio.vue";

const emits = defineEmits<{
  (e: "setActiveFlat", activeType: FlatItem): void;
}>();

const props = defineProps<{
  duplicatedFlat?: FlatItem | null;
  activeFlat: FlatItem | null;
}>();

const projectStore = useProjectStore();
const floorStore = useFloorsStore();
const blockStore = useBlocksStore();
const typesStore = useTypesStore();
const flatStore = useFlatsStore();
const { projectFloors } = storeToRefs(floorStore);
const { projectTypes } = storeToRefs(typesStore);

const confData = [
  { title: "Reserved", value: "reserved" },
  { title: "Sold", value: "sold" }
];

const obj = reactive<any>({
  flat_number: "",
  conf: null,
  type_id: null,
  floor_number: null,
  price: "",
  offer_price: "",
  block_id: null,
  type: {
    title: "",
    teaser: "",
    area_m2: "",
    rooms_count: "",
    image_2d: "",
    image_3d: ""
  }
});

const useType = ref("true");
const showTypeModal = ref(false);
const activeType = ref<TypeItem | null>(null);

const floorsNumberData = computed(() => {
  if (!projectFloors.value) return [];

  return Array.from(new Set(projectFloors.value.map((item) => item.floor_number)))
    .sort((a, b) => a - b)
    ?.map((floor) => {
      return { title: `floor - ${floor}`, value: floor.toString() };
    });
});

const typesData = computed(() => {
  if (!projectTypes.value) return [];

  return projectTypes.value?.map((type) => {
    return { title: type.title, value: type.id.toString() };
  });
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

const submitForm = async () => {
  const params = {
    ...obj,
    conf: (obj.conf as selectDataItem | null)?.value || "",
    type_id: (obj.type_id as selectDataItem | null)?.value,
    floor_number: (obj.floor_number as selectDataItem | null)?.value,
    project_id: projectStore?.id,
    block_id: obj.block_id?.value || null,
    use_type: useType.value,
    type: { ...obj.type }
  };

  if (obj.type.image_2d) {
    params.type.image_2d = obj.type.image_2d.map((i: any) => i.id);
  }

  if (obj.type.image_3d) {
    params.type.image_3d = obj.type.image_3d.map((i: any) => i.id);
  }

  if (props.activeFlat) {
    await editFlat(params);
  } else {
    await createFlat(params);
  }

  flatStore.fetchProjectFlats(projectStore.id);
};

const editFlat = async (params: any) => {
  const { data } = await ajaxAxios.post("", {
    action: "irep_update_flat",
    nonce: irePlugin.nonce,
    flat_id: props.activeFlat?.id,
    ...params
  });

  if (data.success) {
    showToast("success", "Flat Updated!");
  } else {
    showToast("error", data?.data || "Something went wrong!");
  }
};

const createFlat = async (params: any) => {
  const { data } = await ajaxAxios.post("", {
    action: "irep_create_flat",
    nonce: irePlugin.nonce,
    ...params
  });

  if (data.success) {
    showToast("success", "Flat Created!");

    emits("setActiveFlat", data.data);
  } else {
    showToast("error", data?.data || "Something went wrong!");
  }
};

const showEditTypeModal = () => {
  activeType.value = projectTypes.value?.find((type) => type.id === obj.type_id?.value) || null;

  if (activeType.value) {
    showTypeModal.value = true;
  }
};

const closeTypeModal = () => {
  showTypeModal.value = false;
  typesStore.fetchProjectTypes(projectStore.id);
};

onMounted(() => {
  floorStore.fetchProjectFloors(Number(projectStore.id));

  let typeInstance = null;
  if (props.activeFlat) {
    typeInstance = props.activeFlat;
  } else if (props.duplicatedFlat) {
    typeInstance = props.duplicatedFlat;
  }

  if (typeInstance) {
    obj.flat_number = typeInstance.flat_number;
    obj.conf = confData.find((item) => item.value === typeInstance.conf) ?? null;
    obj.price = typeInstance.price ?? "";
    obj.offer_price = typeInstance.offer_price ?? "";
    obj.type_id = typesData.value.find((type) => type.value === typeInstance.type_id) ?? null;
    obj.floor_number = floorsNumberData.value.find((floor) => floor.value === typeInstance.floor_number) ?? null;
    obj.block_id = blockSelectData.value.find((block) => block.value === typeInstance.block_id) ?? null;

    useType.value = typeInstance.use_type ? "true" : "false";
    if (typeInstance.type) {
      obj.type = typeInstance.type;
    }
  }
});
</script>

<template>
  <form class="h-full w-full rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
    <div class="flex w-full items-center justify-center bg-gray-50 p-3">
      <h2 class="!text-lg">
        {{ activeFlat ? "Editing flat with ID - " : "Add flat" }}

        <span v-if="activeFlat?.id" class="text-red-600"> {{ activeFlat?.id }} </span>
      </h2>
    </div>

    <div class="flex flex-col items-center gap-3 p-3">
      <Input v-model="obj.flat_number" placeholder="flat-57" label="Flat number/name" required />

      <Select
        v-if="floorsNumberData"
        v-model="obj.floor_number"
        :data="floorsNumberData"
        label="Floor number"
        clearable
      />

      <Select v-model="obj.block_id" :data="blockSelectData" label="select block" clearable />

      <Input v-model="obj.price" placeholder="60000" label="Price" required />
      <Input v-model="obj.offer_price" placeholder="58000" label="Offer price" />
      <Select v-model="obj.conf" :data="confData" label="configuration" clearable />

      <!-- <Select v-model="obj.block_id" :data="[]" label="Block" clearable /> -->

      <div class="flex items-center">
        <Radio v-model="useType" label="Choose type" name="test name" value="true" />
        <Radio v-model="useType" label="Manually" name="test name" value="false" />
      </div>

      <div v-if="useType === 'true'">
        <Select
          v-model="obj.type_id"
          :data="typesData"
          label="Type"
          description="For apartments of the same type, (For example, apartments that have the same area M2, number of rooms, arrangement of rooms) you need to add an entry in the types and then select from this list, Because the same records should not be created many times"
          required
        />

        <Button v-if="obj.type_id" class="!p-1" title="edit type" outlined @click="showEditTypeModal" />
      </div>

      <div v-else class="flex w-full flex-col gap-4 rounded-md border p-3">
        <Input v-model="obj.type.title" placeholder="corner apartment" label="Type title" />
        <Input
          v-model="obj.type.teaser"
          placeholder="Experience the perfect blend of comfort, style, and stunning views!"
          label="Type teaser"
        />

        <Input v-model="obj.type.area_m2" placeholder="62.5" label="area m²" is-float />
        <Input v-model="obj.type.rooms_count" placeholder="3" label="Rooms count" type="number" />

        <UploadImg
          v-model="obj.type.image_2d"
          title="upload image 2d"
          resolution="400 x 400"
          :example-image="irePlugin?.plugin_assets_path + 'exampleImages/flat_2d.jpg'"
          multiple
        />
        <UploadImg
          v-model="obj.type.image_3d"
          title="upload image 3d"
          resolution="400 x 400"
          :example-image="irePlugin?.plugin_assets_path + 'exampleImages/flat_3d.jpg'"
          multiple
        />
      </div>

      <Button v-if="activeFlat" type="submit" title="Edit flat" />

      <div
        v-else-if="!irePlugin.is_premium && flatStore.projectFlats && flatStore.projectFlats?.length >= 25"
        class="w-full"
      >
        <div @click="pushToPlansPage()">
          <Button type="submit" title="Upgrade to add more flats" :disabled="true" />
        </div>
        <p class="mt-2">You can add max 25 flat with free plan</p>
      </div>

      <Button v-else type="submit" :title="activeFlat ? 'Edit flat' : 'Add flat'" />
    </div>
  </form>

  <teleport to="#irep-vue-app">
    <Transition name="fade">
      <Modal v-if="showTypeModal" @close="closeTypeModal" type="2" width="w-[500px]">
        <CreateEditTypeModal :activeType="activeType" />
      </Modal>
    </Transition>
  </teleport>
</template>
