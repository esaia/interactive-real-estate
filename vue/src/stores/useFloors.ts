import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { FloorItem, PolygonDataCollection } from "../../types/components";
import { transformSvgString } from "../composables/helpers";

export const useFloorsStore = defineStore("floors", () => {
  const activeFloor = ref<FloorItem | null>();
  const activeGroup = ref<SVGGElement | null>(null);
  const floorSvgRef = ref<HTMLDivElement | null>(null);

  const setActiveFloor = (floor: FloorItem | null) => {
    activeFloor.value = floor;
  };

  const addPoligonData = (key: string) => {
    if (!activeFloor.value) return;

    if (!activeFloor.value.polygon_data) {
      activeFloor.value.polygon_data = [];
    }

    const newPolygonData: PolygonDataCollection = {
      id: "",
      key: key,
      type: ""
    };

    activeFloor.value.polygon_data.push(newPolygonData);
  };

  const removePoligonItem = (key: string) => {
    if (!activeFloor.value || !activeFloor.value.polygon_data) {
      console.error("No active floor to remove polygon data from.");
      return;
    }

    if (activeFloor.value.polygon_data) {
      const index = activeFloor.value.polygon_data.findIndex((item) => item.key === key);
      if (index !== -1) {
        activeFloor.value.polygon_data.splice(index, 1);
      } else {
        console.warn(`Polygon item with key "${key}" not found.`);
      }
    }
  };

  watch(
    () => activeFloor.value?.svg,
    () => {
      if (!activeFloor.value) {
        return;
      }

      activeFloor.value.svg = transformSvgString(activeFloor.value.svg);
      //  transformSvgString(active);
    },
    { immediate: true }
  );

  return {
    activeFloor,
    setActiveFloor,
    activeGroup,
    floorSvgRef,
    addPoligonData,
    removePoligonItem
  };
});
