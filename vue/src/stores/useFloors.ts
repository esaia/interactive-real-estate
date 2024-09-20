import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { FloorItem, PolygonDataCollection } from "../../types/components";
import { transformSvgString } from "../composables/helpers";
import ajaxAxios from "../utils/axios";

export const useFloorsStore = defineStore("floors", () => {
  const activeFloor = ref<FloorItem | null>();
  const projectFloors = ref<FloorItem[]>();
  const activeGroup = ref<SVGGElement | null>(null);
  const floorSvgRef = ref<HTMLDivElement | null>(null);

  const setActiveFloor = (floor: FloorItem | null) => {
    activeFloor.value = floor;
  };

  const editpoligonData = (key: string, updatedData: PolygonDataCollection) => {
    const index = activeFloor.value?.polygon_data.findIndex((polygon) => polygon.key === key);

    if (index !== -1) {
      if (!activeFloor.value) return;

      activeFloor.value.polygon_data = activeFloor.value?.polygon_data.map((polygon, i) => {
        if (i === index) {
          return { ...polygon, ...updatedData };
        } else {
          return polygon;
        }
      });
    } else {
      console.error(`Polygon with id ${activeFloor.value?.id} not found.`);
    }
  };

  const addPolygonData = (key: string) => {
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

  const fetchProjectFloors = async (id: number) => {
    const { data } = await ajaxAxios.post("", {
      action: "get_floors",
      nonce: irePlugin.nonce,
      project_id: id,
      per_page: 99999
    });

    if (!data.success) {
      return;
    }

    projectFloors.value = data.data?.data;
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
    projectFloors,
    activeFloor,
    setActiveFloor,
    activeGroup,
    floorSvgRef,
    addPolygonData,
    removePoligonItem,
    editpoligonData,
    fetchProjectFloors
  };
});
