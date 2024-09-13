<script setup lang="ts">
import Delete from "../../icons/Delete.vue";
import Duplicate from "../../icons/Duplicate.vue";
import Edit from "../../icons/Edit.vue";

defineEmits<{
  (e: "editAction", item: (typeof props.data)[0]): void;
}>();

const props = defineProps<{ data: any }>();
</script>

<template>
  <table class="w-full border-collapse text-left text-sm text-gray-500 rtl:text-right">
    <thead
      class="bg-gray-50 text-xs uppercase text-gray-700 [&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-2"
    >
      <tr>
        <th scope="col" class="w-20">Actions</th>

        <slot name="header" />
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data" class="bg-white hover:bg-gray-50 [&_td]:border [&_td]:px-2 [&_td]:py-1">
        <td class="w-20 items-center text-right">
          <div class="flex">
            <div
              class="table-list-actions hover:bg-gray-400 [&_path]:hover:fill-white"
              @click="$emit('editAction', item)"
            >
              <Edit />
            </div>

            <div class="table-list-actions hover:bg-blue-400 [&_path]:hover:fill-white">
              <Duplicate />
            </div>

            <div class="table-list-actions hover:bg-red-500 [&_path]:hover:fill-white">
              <Delete />
            </div>
          </div>
        </td>

        <slot :slotProps="item" />
      </tr>
    </tbody>
  </table>
</template>

<style>
.table-list-actions {
  @apply h-fit cursor-pointer border border-r-0 border-gray-200 p-1 transition-all first:rounded-l-sm last-of-type:rounded-r-sm last-of-type:border-r group-hover:border-gray-300 [&_svg]:h-4 [&_svg]:w-4;
}
</style>
