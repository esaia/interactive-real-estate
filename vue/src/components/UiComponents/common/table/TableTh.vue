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

  if (props.sortOrder === "ASC") {
    emits("sort", props.field, "DESC");
  } else if (props.sortOrder === "DESC") {
    emits("sort", "", "");
  } else {
    emits("sort", props.field, "ASC");
  }
};
</script>

<template>
  <th
    scope="col"
    class="cursor-pointer transition-all hover:bg-gray-900 hover:text-white"
    :class="{ 'bg-gray-900 text-white': sortField === field }"
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
