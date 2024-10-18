<script setup lang="ts">
import { ActionData } from "@/types/components";
import BaseEditor from "../uiComponents/BaseEditor.vue";

defineProps<{
  modalData: ActionData;
}>();
</script>

<template>
  <div>
    <p class="!text-3xl font-bold">{{ modalData?.modalObject?.title }}</p>
    <BaseEditor :editor="modalData?.modalObject?.description"></BaseEditor>

    <img :src="modalData.modalObject.modalImage?.[0]?.url" alt="" class="mt-5 h-[400px] w-full object-contain" />
  </div>
</template>
