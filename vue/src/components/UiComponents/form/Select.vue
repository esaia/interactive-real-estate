<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import ArrowRight from "../icons/ArrowRight.vue";
import { selectDataItem } from "@/types/components";

const props = withDefaults(
  defineProps<{
    data: selectDataItem[];
    modelValue: selectDataItem;
    defaultValue?: selectDataItem | null;
    placeholder?: string;
    itemPrefix?: string;
    borderStyle?: "Default" | "Underlined";
  }>(),
  {
    placeholder: "",
    defaultValue: null,
    borderStyle: "Default"
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", param: typeof props.modelValue): void;
}>();

const selectModelValue = computed({
  get() {
    return props.modelValue || props.defaultValue || { title: "choose", value: "" };
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  }
});

const input = ref("");

const isModalOpen = ref(false);
const activeItems = ref(props.data);

const inputPlaceholder = computed(() => {
  return selectModelValue ? selectModelValue.value?.title : props.placeholder || "";
});

const selectItem = (item: selectDataItem) => {
  if (item.isLinked) return;

  selectModelValue.value = item;

  input.value = "";
  setTimeout(() => {
    isModalOpen.value = false;
  }, 0);
};

const onClickOutside = () => {
  isModalOpen.value = false;
};

watchEffect(() => {
  activeItems.value = props.data;
});

watch(
  () => input.value,
  (ns) => {
    if (!ns) {
      activeItems.value = props.data;
    } else {
      activeItems.value = props.data?.filter((item) => item?.title.toLowerCase().includes(ns));
    }
  }
);

watch(
  () => isModalOpen.value,
  (ns) => {
    if (!ns) {
      input.value = "";
    }
  }
);
</script>

<template>
  <div
    v-click-outside="onClickOutside"
    class="relative flex h-full w-full min-w-20 cursor-pointer items-center justify-between rounded-sm ring-1 ring-primary transition-all focus-within:ring-2"
    @click="isModalOpen = true"
  >
    <input
      v-model="input"
      type="text"
      class="w-full !rounded-md !border-none shadow-none placeholder:text-black focus:!shadow-none"
      :placeholder="inputPlaceholder"
    />

    <div class="mx-2 [&_svg]:h-5 [&_svg]:w-5">
      <ArrowRight class="transition-all" :class="{ '-rotate-90': isModalOpen, 'rotate-90': !isModalOpen }" />
    </div>

    <div
      class="absolute left-0 top-[calc(100%+10px)] z-20 h-fit max-h-[200px] w-full origin-top overflow-y-auto rounded-md border bg-white p-2 shadow-sm transition-all"
      :class="{
        'scale-y-100': isModalOpen,
        'scale-y-0': !isModalOpen
      }"
    >
      <div v-if="activeItems.length">
        <button
          v-for="item in activeItems"
          :key="item.value"
          type="button"
          class="line-clamp-1 w-full min-w-32 rounded-sm px-[8px] py-[6px] text-start transition-all hover:bg-gray-100"
          :class="`${item.value === selectModelValue.value ? '!bg-primary text-white' : item?.isLinked ? 'cursor-not-allowed bg-gray-400 text-white hover:bg-gray-500' : ''} `"
          @click="selectItem(item)"
        >
          <!-- {{ itemPrefix }} -->
          {{ item.title }}
          <!-- {{ item.isLinked && item.value !== selectModelValue.value ? " - Linked" : "" }} -->
        </button>
      </div>

      <button v-else class="line-clamp-1 w-full min-w-32 px-[8px] py-[6px] text-start">nothing found</button>
    </div>
  </div>
</template>
