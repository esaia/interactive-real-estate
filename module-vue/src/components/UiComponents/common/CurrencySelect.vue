<script setup lang="ts">
import Select from "../form/Select.vue";
import { selectDataItem } from "@/types/components";
import { useMetaStore } from "@/src/stores/useMeta";

const currencyModel = defineModel<selectDataItem | null>({ default: null });

const metaStore = useMetaStore();
</script>
<template>
  <div>
    <Select v-model="currencyModel" :data="metaStore.currencyData" label="Select currency symbol:" />
  </div>
</template>
