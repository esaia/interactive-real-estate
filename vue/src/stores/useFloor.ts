import { defineStore } from "pinia";
import { ref } from "vue";
import { FloorInterface } from "../../types/components";

export const useProjectStore = defineStore("floors", () => {
  const floors = ref<FloorInterface[]>();

  return {
    floors
  };
});
