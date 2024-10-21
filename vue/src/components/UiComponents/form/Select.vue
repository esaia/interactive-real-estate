<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import ArrowRight from "../icons/ArrowRight.vue";
import { selectDataItem } from "@/types/components";
import Close from "../icons/Close.vue";
import Input from "./Input.vue";
import Info from "../icons/Info.vue";

const props = withDefaults(
  defineProps<{
    data: selectDataItem[];
    modelValue: selectDataItem | null;
    defaultValue?: selectDataItem | null;
    placeholder?: string;
    label?: string;
    placeholderPrefix?: string;
    clearable?: boolean;
    required?: boolean;
    isSearchable?: boolean;
    description?: string;
  }>(),
  {
    placeholder: "Choose",
    placeholderPrefix: "",
    defaultValue: null,
    label: "",
    clearable: false,
    isSearchable: true,
    description: ""
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", param: typeof props.modelValue): void;
}>();

const selectModelValue = computed({
  get() {
    return props.modelValue || props.defaultValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  }
});

const input = ref("");

const isModalOpen = ref(false);
const activeItems = ref(props.data);

const inputPlaceholder = computed(() => {
  return props.placeholderPrefix + (selectModelValue.value ? selectModelValue.value?.title : props.placeholder || "");
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

const clearData = () => {
  selectModelValue.value = null;
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
  <div class="custom-scroll w-full">
    <p v-if="label" class="label">{{ label }} <span v-if="required" class="text-red-600">*</span></p>

    <div
      v-click-outside="onClickOutside"
      class="relative flex h-full w-full min-w-20 cursor-pointer items-center justify-between rounded-sm ring-1 ring-gray-200 transition-all focus-within:!ring-2 focus-within:!ring-primary"
      @click="isModalOpen = true"
    >
      <!-- <input
        v-model="input"
        type="text"
        class="w-full !rounded-md !border-none shadow-none outline-none focus:!shadow-none"
        :class="{ 'placeholder:text-gray-600': modelValue?.value }"
        :placeholder="inputPlaceholder"
      /> -->
      <Input
        v-if="isSearchable"
        v-model="input"
        :placeholder="inputPlaceholder"
        class="[&_input]:!ring-0 focus:[&_input]:!ring-0"
        :class="{ '[&_input]:placeholder:text-black': selectModelValue?.value }"
      />
      <p v-else class="!px-2 !py-1">{{ inputPlaceholder }}</p>

      <div class="mx-2 flex items-center gap-1 [&_path]:fill-gray-400">
        <div class="group" @click.stop="clearData">
          <Close
            v-if="clearable && selectModelValue?.value"
            class="h-3 w-3 transition-all group-hover:[&_path]:fill-gray-500"
          />
        </div>

        <ArrowRight class="h-5 w-5 transition-all" :class="{ '-rotate-90': isModalOpen, 'rotate-90': !isModalOpen }" />
      </div>

      <div
        class="absolute left-0 top-[calc(100%+10px)] z-20 h-fit max-h-[200px] w-full origin-top overflow-y-auto rounded-md !border !border-solid !border-gray-100 bg-white p-2 !shadow-sm transition-all duration-200"
        :class="{
          'scale-y-100': isModalOpen,
          'scale-y-0': !isModalOpen
        }"
      >
        <div v-if="activeItems.length">
          <div
            v-for="item in activeItems"
            :key="item.value"
            type="button"
            class="line-clamp-2 w-full cursor-pointer rounded-sm px-[8px] py-[6px] text-start transition-all hover:bg-gray-100"
            :class="`${item.value === selectModelValue?.value && item.type === selectModelValue.type ? '!bg-primary text-white' : item?.isLinked ? '!cursor-not-allowed text-gray-400 hover:bg-white' : ''} `"
            @click="selectItem(item)"
          >
            {{ item.title }}
            <span class="text-xs text-red-600">
              {{ item.isLinked && item.value !== selectModelValue?.value ? " - linked" : "" }}
            </span>
          </div>
        </div>

        <div v-else class="line-clamp-1 w-full min-w-32 cursor-pointer px-[8px] py-[6px] text-start">nothing found</div>
      </div>
    </div>
    <div v-if="description" class="label mt-2 flex items-start gap-2">
      <Info class="min-h-4 min-w-4" />

      <p>
        {{ description }}
      </p>
    </div>
  </div>
</template>
