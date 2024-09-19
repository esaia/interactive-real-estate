<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import Button from "../form/Button.vue";
import Input from "../form/Input.vue";
import Select from "../form/Select.vue";
import { useFloorsStore } from "@/src/stores/useFloors";
import { storeToRefs } from "pinia";
import { useTypesStore } from "@/src/stores/useTypes";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";
import { FlatItem, selectDataItem } from "@/types/components";
import { useToast } from "vue-toast-notification";

const emits = defineEmits<{
  (e: "setActiveFlat", activeType: FlatItem): void;
}>();

const props = defineProps<{
  duplicatedFlat: FlatItem | null;
  activeFlat: FlatItem | null;
}>();

const projectStore = useProjectStore();
const floorStore = useFloorsStore();
const typesStore = useTypesStore();
const { projectFloors } = storeToRefs(floorStore);
const { projectTypes } = storeToRefs(typesStore);

const $toast = useToast();

const confData = [
  { title: "Reserved", value: "reserved" },
  { title: "Sold", value: "sold" }
];

const obj = reactive<any>({
  flat_number: "",
  conf: null,
  type_id: null,
  floor_id: null,
  price: "",
  offer_price: "",
  block_id: null
});

const floorsNumberData = computed(() => {
  if (!projectFloors.value) return [];

  return projectFloors.value?.map((floor) => {
    return { title: floor.title || `floor - ${floor.floor_number}`, value: floor.id.toString() };
  });
});

const typesData = computed(() => {
  if (!projectTypes.value) return [];

  return projectTypes.value?.map((type) => {
    return { title: type.title, value: type.id.toString() };
  });
});

const submitForm = async () => {
  const params = {
    ...obj,
    conf: (obj.conf as selectDataItem | null)?.value,
    type_id: (obj.type_id as selectDataItem | null)?.value,
    floor_id: (obj.floor_id as selectDataItem | null)?.value,
    project_id: projectStore?.id
  };

  if (props.activeFlat) {
    editFlat(params);
  } else {
    createFlat(params);
  }
};

const editFlat = async (params: any) => {
  const { data } = await ajaxAxios.post("", {
    action: "update_flat",
    nonce: irePlugin.nonce,
    flat_id: props.activeFlat?.id,
    ...params
  });

  if (data.success) {
    $toast.success("Flat Updated!", {
      position: "top"
    });

    emits("setActiveFlat", data.data);
  } else {
    $toast.error(data?.data || "Something went wrong!", {
      position: "top"
    });
  }
};

const createFlat = async (params: any) => {
  const { data } = await ajaxAxios.post("", {
    action: "create_flat",
    nonce: irePlugin.nonce,
    ...params
  });

  if (data.success) {
    $toast.success("Flat Created!", {
      position: "top"
    });

    emits("setActiveFlat", data.data);
  } else {
    $toast.error(data?.data || "Something went wrong!", {
      position: "top"
    });
  }
};

onMounted(() => {
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
    obj.floor_id = floorsNumberData.value.find((floor) => floor.value === typeInstance.floor_id) ?? null;
  }
});
</script>

<template>
  <form class="h-fu' w-full rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
    <div class="flex w-full items-center justify-center bg-gray-50 p-3">
      <h2 class="text-lg">{{ activeFlat ? "Edit flat" : "Add flat" }}</h2>
    </div>

    <div class="flex flex-col items-center gap-3 p-3">
      <Input v-model="obj.flat_number" placeholder="23 - flat" label="Flat number/name" required />

      <Select v-if="floorsNumberData" v-model="obj.floor_id" :data="floorsNumberData" label="Floor number" required />

      <Select v-model="obj.type_id" :data="typesData" label="Type" clearable required />

      <Select v-model="obj.conf" :data="confData" label="select conf" clearable />

      <Input v-model="obj.price" placeholder="60000" label="Price" type="number" required />
      <Input v-model="obj.offer_price" placeholder="58000" label="Offer price" type="number" />

      <Select v-model="obj.block_id" :data="[]" label="Block" clearable />

      <Button type="submit" :title="activeFlat ? 'Edit flat' : 'Add flat'" />
    </div>
  </form>
</template>
