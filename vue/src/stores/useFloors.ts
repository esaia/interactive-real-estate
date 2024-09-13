import { defineStore } from "pinia";
import { ref } from "vue";
import { FloorItem } from "../../types/components";

export const useFloorsStore = defineStore("floors", () => {
  const activeFloor = ref<FloorItem | null>();
  const activeGroup = ref<SVGGElement | null>(null);
  const floorSvgRef = ref<HTMLDivElement | null>(null);

  const setActiveFloor = (floor: FloorItem | null) => {
    activeFloor.value = floor;
  };

  const addPoligonData = (key: string) => {
    // activeFloor.value?.polygon_data = [...polygon_data.value, { id: "", key, type: "" }];
  };

  const removePoligonItem = (key: string) => {
    // if (!key || !polygon_data.value) return;
    // polygon_data.value = polygon_data.value.filter((item) => item.key !== key);
  };

  return {
    activeFloor,
    setActiveFloor,
    activeGroup,
    floorSvgRef,
    addPoligonData,
    removePoligonItem
  };
});
