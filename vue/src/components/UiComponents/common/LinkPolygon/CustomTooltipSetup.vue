<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Select from "../../form/Select.vue";
import Input from "../../form/Input.vue";
import UploadImg from "../../form/UploadImg.vue";
import { imageInterface } from "@/types/components";
import { useProjectStore } from "@/src/stores/useProject";
import { useFloorsStore } from "@/src/stores/useFloors";
import { useBlocksStore } from "@/src/stores/useBlock";

const props = defineProps<{
  isFloorsCanvas: boolean;
  isBlockCanvas?: boolean;
}>();

const projectsStore = useProjectStore();
const floorsStore = useFloorsStore();
const blockStore = useBlocksStore();

const actions = [
  { title: "no action", value: "no-action" },
  { title: "open modal", value: "modal" },
  { title: "follow link", value: "url" }
];

const action = ref(actions[0]);
const url = ref("#");
const modalImage = ref<imageInterface[] | null>(null);

const data = computed(() => {
  return;
});

watch(
  () => data.value,
  () => {
    // if (props.isFloorsCanvas) {
    //       floorsStore.editpoligonData(key, { id: ns?.value || "", key, type: ns.type || "" });
    //     } else if (props.isBlockCanvas) {
    //       blockStore.editpoligonData(key, { id: ns?.value || "", key, type: ns.type || "" });
    //     } else {
    //       projectsStore.editpoligonData(key, { id: ns?.value || "", key, type: ns.type || "" });
    //     }
  }
);
</script>
<template>
  <div class="w-full">
    <Select v-model="action" :data="actions" label="Select Action" />

    <div v-if="action.value === 'modal'" class="mt-3">
      <input
        type="text"
        placeholder="Title..."
        class="mb-2 w-full !border-none !px-0 font-bold !outline-none focus:!shadow-none"
      />

      <textarea
        placeholder="Description..."
        class="block w-full !border-none !outline-none focus:!shadow-none"
      ></textarea>

      <UploadImg v-model="modalImage" title="Upload modal image" required />
    </div>

    <div v-else-if="action.value === 'url'" class="mt-3">
      <Input v-model="url" label="url" />

      <label class="mt-3 flex items-center">
        <input type="checkbox" />
        <p class="label cursor-pointer capitalize">Open in new window</p>
      </label>
    </div>

    <label class="mt-3 flex items-center border-t pt-3">
      <input type="checkbox" />
      <p class="label">Enable Tooltip</p>
    </label>
  </div>
</template>
