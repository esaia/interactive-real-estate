<script setup lang="ts">
import Sort from "../../icons/Sort.vue";
import SortDown from "../../icons/SortDown.vue";
import SortUp from "../../icons/SortUp.vue";

const emits = defineEmits<{
  (e: "sort", field: string, sortOrder: "ASC" | "DESC" | ""): void;
}>();

const props = defineProps<{
  fieldTitle: string;
  field: string;
  sortable?: boolean;
  sortField?: string;
  sortOrder?: "ASC" | "DESC" | "";
}>();

const sort = () => {
  if (!props.sortable) return;

  // if (props.sortField === props.field) {
  //   sortOrder.value = sortOrderString;

  // } else {
  //   props.sortField =  props.field;
  //   sortOrder.value = "ASC";
  // }

  const generateSortOrder = (sortOrder: "ASC" | "DESC" | "") => {
    if (sortOrder === "ASC") {
      return "DESC";
    } else if (sortOrder === "DESC") {
      return "";
    } else {
      return "ASC";
    }
  };

  if (props.sortField === props.field) {
    if (props.sortOrder === "DESC") {
      emits("sort", "", "");
    } else {
      emits("sort", props.field, generateSortOrder(props.sortOrder || ""));
    }
  } else {
    emits("sort", props.field, "ASC");
  }
};
</script>

<template>
  <th
    scope="col"
    class="transition-all"
    :class="{
      'bg-gray-900 text-white': sortField === field,
      'cursor-pointer hover:bg-gray-900 hover:text-white': sortable
    }"
    @click="sort"
  >
    <div class="flex w-full items-center gap-2">
      <p>{{ fieldTitle }}</p>

      <SortDown v-if="sortField === field && sortOrder === 'ASC'" />
      <SortUp v-else-if="sortField === field && sortOrder === 'DESC'" />

      <Sort v-else-if="sortable" />
    </div>
  </th>
</template>
