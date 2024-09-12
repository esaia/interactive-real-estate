import { defineStore } from "pinia";
import { ref } from "vue";
import { FloorInterface } from "../../types/components";

export const useFloorsStore = defineStore("floors", () => {
  const activeFloor = ref<FloorInterface>();

  const setActiveFloor = async (floor: FloorInterface) => {
    activeFloor.value = floor;
  };

  return {
    activeFloor,
    setActiveFloor
  };
});
