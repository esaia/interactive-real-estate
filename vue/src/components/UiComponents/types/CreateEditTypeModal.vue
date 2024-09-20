<script setup lang="ts">
import { onMounted, reactive } from "vue";
import Button from "../form/Button.vue";
import Input from "../form/Input.vue";
import UploadImg from "../form/UploadImg.vue";
import ajaxAxios from "@/src/utils/axios";
import { useToast } from "vue-toast-notification";
import { useProjectStore } from "@/src/stores/useProject";
import { storeToRefs } from "pinia";
import { imageInterface, TypeItem } from "@/types/components";

interface TypeFormInterface {
  title: string;
  teaser: string;
  image_2d: imageInterface[] | null;
  image_3d: imageInterface[] | null;
  gallery: imageInterface[] | null;
  area_m2: string;
  rooms_count: string;
  project_id: string;
}

const emits = defineEmits<{
  (e: "setActiveType", activeType: TypeItem): void;
}>();

const props = defineProps<{
  duplicatedType?: TypeItem | null;
  activeType: TypeItem | null;
}>();

const $toast = useToast();
const projectStore = useProjectStore();
const { id } = storeToRefs(projectStore);

const obj = reactive<TypeFormInterface>({
  title: "",
  teaser: "",
  image_2d: null,
  image_3d: null,
  gallery: null,
  area_m2: "",
  rooms_count: "",
  project_id: id.value
});

const submitForm = async () => {
  const params: any = { ...obj };

  if (obj.image_2d) {
    params.image_2d = obj.image_2d?.[0]?.id;
  }

  if (obj.image_3d) {
    params.image_3d = obj.image_3d?.[0]?.id;
  }

  if (obj.gallery) {
    params.gallery = obj.gallery.map((i) => i.id);
  }

  if (props.activeType) {
    editType(params);
  } else {
    createType(params);
  }
};

const editType = async (params: any) => {
  const { data } = await ajaxAxios.post("", {
    action: "update_type",
    nonce: irePlugin.nonce,
    type_id: props.activeType?.id,
    ...params
  });

  if (data.success) {
    $toast.success("Type updated!", {
      position: "top"
    });
  } else {
    $toast.error(data?.data || "Something went wrong!", {
      position: "top"
    });
  }
};

const createType = async (params: any) => {
  const { data } = await ajaxAxios.post("", {
    action: "create_type",
    nonce: irePlugin.nonce,
    ...params
  });

  emits("setActiveType", data?.data);

  if (data.success) {
    $toast.success("Type created!", {
      position: "top"
    });
  } else {
    $toast.error(data?.data || "Something went wrong!", {
      position: "top"
    });
  }
};

onMounted(() => {
  let typeInstance = null;
  if (props.activeType) {
    typeInstance = props.activeType;
  } else if (props.duplicatedType) {
    typeInstance = props.duplicatedType;
  }

  if (typeInstance) {
    obj.title = typeInstance.title;
    obj.teaser = typeInstance.teaser;
    obj.area_m2 = typeInstance.area_m2;
    obj.rooms_count = typeInstance.rooms_count;
    obj.image_2d = typeInstance.image_2d ?? null;
    obj.image_3d = typeInstance.image_3d ?? null;
    obj.gallery = typeInstance.gallery ?? null;
  }
});
</script>

<template>
  <form class="h-fu' w-full rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
    <div class="flex w-full items-center justify-center bg-gray-50 p-3">
      <h2 class="text-lg text-primary">
        {{ activeType ? "Editing type with id - " : "Add type" }}

        <span v-if="activeType?.id" class="text-red-600"> {{ activeType?.id }} </span>
      </h2>
    </div>

    <div class="flex flex-col items-center gap-3 p-3">
      <Input v-model="obj.title" placeholder="" label="Type title" required />
      <Input v-model="obj.teaser" placeholder="" label="Type teaser" />

      <Input v-model="obj.area_m2" placeholder="62.5" label="area m²" is-float />
      <Input v-model="obj.rooms_count" placeholder="3" label="Rooms count" type="number" />

      <UploadImg v-model="obj.image_2d" title="upload image 2d" />
      <UploadImg v-model="obj.image_3d" title="upload image 3d" />
      <UploadImg v-model="obj.gallery" title="upload gallery" multiple />

      <Button type="submit" :title="activeType ? 'Edit type' : 'Add type'" />
    </div>
  </form>
</template>
