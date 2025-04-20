<script setup lang="ts">
import { computed } from "vue";
import { VueAwesomePaginate } from "vue-awesome-paginate";
import ArrowRight from "../icons/ArrowRight.vue";

const emit = defineEmits<{
  (e: "update:modelValue", params: typeof props.modelValue): void;
}>();

const props = defineProps<{
  modelValue: number;
  totalItems: number;
  perPage: number;
}>();

const inputModel = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  }
});
</script>

<template>
  <div v-if="totalItems > perPage" class="flex w-full items-center justify-between py-5">
    <p>{{ (inputModel - 1) * perPage }} to {{ perPage * inputModel }} of {{ totalItems }} entries</p>

    <VueAwesomePaginate :total-items="totalItems" :items-per-page="perPage" :max-pages-shown="5" v-model="inputModel">
      <template #prev-button>
        <div class="flex h-full rotate-180 items-center justify-center [&_svg]:h-4 [&_svg]:w-4">
          <ArrowRight />
        </div>
      </template>

      <template #next-button>
        <div class="flex items-center justify-center [&_svg]:h-4 [&_svg]:w-4">
          <ArrowRight />
        </div>
      </template>
    </VueAwesomePaginate>
  </div>
</template>

<style>
.pagination-container {
  display: flex;
  border: 1px solid rgb(229 231 235);
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
}

.paginate-buttons {
  height: 30px;
  width: 30px;
  cursor: pointer;
  color: #1e293b;
}

.paginate-buttons:hover,
.paginate-buttons:hover svg path {
  background-color: #1e293b;
  color: white;
  fill: white;
  overflow: hidden;
}

.active-page {
  background-color: #1e293b;
  color: white;
}

.active-page:hover {
  /* background-color: #2988c8; */
}
</style>
