<script setup lang="ts">
import { onMounted, ref } from "vue";
import Button from "../form/Button.vue";
import Input from "../form/Input.vue";
import Select from "../form/Select.vue";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "@/src/stores/useProject";
import { ActionItem, ModalObject } from "@/types/components";
import { showToast } from "@/src/composables/helpers";
import TextArea from "../form/TextArea.vue";
import UploadImg from "../form/UploadImg.vue";
import Checkbox from "../form/Checkbox.vue";

const emits = defineEmits<{
  (e: "setActiveAction", activeType: ActionItem): void;
}>();

const props = defineProps<{
  duplicatedAction?: ActionItem | null;
  activeAction: ActionItem | null;
}>();

const projectStore = useProjectStore();

const actions = [
  { title: "no action", value: "no-action" },
  { title: "open modal", value: "modal" },
  { title: "follow link", value: "url" },
  { title: "run script", value: "script", isDisabled: !irePlugin.is_premium }
];

const title = ref("");
const action = ref(actions[0]);
const modalObject = ref<ModalObject>({
  title: "",
  description: "",
  modalImage: null
});
const url = ref("#");
const targetBlank = ref();

const script = ref("");
const loading = ref(false);

const submitForm = async () => {
  const params = {
    nonce: irePlugin.nonce,
    project_id: projectStore?.id,
    title: title.value,
    data: {
      actionType: action.value?.value,
      modalObject: modalObject.value,
      url: url.value,
      targetBlank: targetBlank.value,
      script: script.value
    }
  };
  loading.value = true;

  if (props.activeAction) {
    try {
      await editAction(params);
    } catch (error) {
      showToast("error", "Something went wrong!");
    }
  } else {
    try {
      await createAction(params);
    } catch (error) {
      showToast("error", "Something went wrong!");
    }
  }

  loading.value = false;
};

const editAction = async (params: any) => {
  const { data } = await ajaxAxios.post("", {
    action: "irep_update_tooltip",
    action_id: props.activeAction?.id,
    ...params
  });

  if (data.success) {
    showToast("success", "Action Updated!");
  } else {
    showToast("error", data?.data || "Something went wrong!");
  }
};

const createAction = async (params: any) => {
  const { data } = await ajaxAxios.post("", {
    action: "irep_create_tooltip",

    ...params
  });

  if (data.success) {
    showToast("success", "Action Created!");

    emits("setActiveAction", data.data);
  } else {
    showToast("error", data?.data || "Something went wrong!");
  }
};

onMounted(() => {
  let actionInstance = null;
  if (props.activeAction) {
    actionInstance = props.activeAction;
  } else if (props.duplicatedAction) {
    actionInstance = props.duplicatedAction;
  }

  if (actionInstance) {
    title.value = actionInstance?.title;
    action.value = actions.find((item) => item.value === actionInstance.data?.actionType) || actions[0];
    modalObject.value = actionInstance?.data?.modalObject;
    url.value = actionInstance?.data?.url;
    targetBlank.value = actionInstance?.data?.targetBlank;
    script.value = actionInstance?.data?.script;
  }
});
</script>

<template>
  <form class="h-full w-full rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
    <div class="flex w-full items-center justify-center bg-gray-50 p-3">
      <h2 class="!text-lg">
        {{ activeAction ? "Editing action with ID - " : "Add action" }}

        <span v-if="activeAction?.id" class="text-red-600"> {{ activeAction?.id }} </span>
      </h2>
    </div>

    <div class="flex flex-col items-center gap-3 p-3">
      <Input v-model="title" label="Action title" required />

      <Select v-model="action" :data="actions" label="Select Action" required />

      <div v-if="action.value !== 'no-action'" class="w-full rounded-md border border-gray-200 p-3">
        <h4 class="font-bold capitalize">{{ action.title }}:</h4>
        <div v-if="action.value === 'modal'" class="mt-3 flex w-full flex-col gap-3">
          <Input v-model="modalObject.title" label="Action title" />
          <TextArea
            v-model="modalObject.description"
            label="Description"
            placeholder="<p> you can use <b> html </b> code here </p>"
          />

          <UploadImg v-model="modalObject.modalImage" title="Upload modal image" />
        </div>

        <div v-else-if="action.value === 'url'" class="mt-3 w-full">
          <Input v-model="url" label="url" />

          <Checkbox v-model="targetBlank" title="Open in new window" class="mt-2" />
        </div>

        <div v-else-if="action.value === 'script'" class="mt-3 w-full">
          <TextArea v-model="script" label="Script" placeholder="console.log('hello world')" />
        </div>
      </div>

      <Button type="submit" :title="activeAction ? 'Edit action' : 'Add action'" :loading="loading" />
    </div>
  </form>
</template>
