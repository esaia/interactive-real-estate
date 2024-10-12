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
import { showToast } from "@/src/composables/helpers";
import { useFlatsStore } from "@/src/stores/useFlats";

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
  block_id: null
});

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
    block_id: obj.block_id?.value
  };

  if (props.activeFlat) {
    await editFlat(params);
  } else {
    await createFlat(params);
  }

  flatStore.fetchProjectFlats(projectStore.id);
};

const editFlat = async (params: any) => {
  const { data } = await ajaxAxios.post("", {
    action: "update_flat",
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
    action: "create_flat",
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
  }
});
</script>

<template>
  <form class="h-full w-full rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
    <div class="flex w-full items-center justify-center bg-gray-50 p-3">
      <h2 class="text-lg">
        {{ activeFlat ? "Editing flat with ID - " : "Add flat" }}

        <span v-if="activeFlat?.id" class="text-red-600"> {{ activeFlat?.id }} </span>
      </h2>
    </div>

    <div class="flex flex-col items-center gap-3 p-3">
      <Input v-model="obj.flat_number" placeholder="23 - flat" label="Flat number/name" required />

      <Select
        v-if="floorsNumberData"
        v-model="obj.floor_number"
        :data="floorsNumberData"
        label="Floor number"
        clearable
      />

      <Select v-model="obj.block_id" :data="blockSelectData" label="select block" clearable />

      <Select v-model="obj.type_id" :data="typesData" label="Type" required />
      <Button v-if="obj.type_id" class="!p-1" title="edit type" outlined @click="showEditTypeModal" />

      <Input v-model="obj.price" placeholder="60000" label="Price" required />
      <Input v-model="obj.offer_price" placeholder="58000" label="Offer price" />
      <Select v-model="obj.conf" :data="confData" label="select conf" clearable />

      <!-- <Select v-model="obj.block_id" :data="[]" label="Block" clearable /> -->

      <Button type="submit" :title="activeFlat ? 'Edit flat' : 'Add flat'" />
    </div>
  </form>

  <teleport to="#my-vue-app">
    <Transition name="fade">
      <Modal v-if="showTypeModal" @close="closeTypeModal" type="2" width="w-[500px]">
        <CreateEditTypeModal :activeType="activeType" />
      </Modal>
    </Transition>
  </teleport>
</template>
