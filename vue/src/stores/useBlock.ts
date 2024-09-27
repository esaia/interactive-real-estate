import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { BlockItem, PolygonDataCollection } from "../../types/components";
import { transformSvgString } from "../composables/helpers";
import ajaxAxios from "../utils/axios";

export const useBlocksStore = defineStore("blocks", () => {
  const activeBlock = ref<BlockItem | null>();
  const projectBlocks = ref<BlockItem[]>();
  const activeBlockGroup = ref<SVGGElement | null>(null);
  const blockSvgRef = ref<HTMLDivElement | null>(null);

  const setActiveBlock = (block: BlockItem | null) => {
    activeBlock.value = block;
  };

  const editpoligonData = (key: string, updatedData: PolygonDataCollection) => {
    const index = activeBlock.value?.polygon_data.findIndex((polygon) => polygon.key === key);

    if (index !== -1) {
      if (!activeBlock.value) return;

      activeBlock.value.polygon_data = activeBlock.value?.polygon_data.map((polygon, i) => {
        if (i === index) {
          return { ...polygon, ...updatedData };
        } else {
          return polygon;
        }
      });
    } else {
      console.error(`Polygon with id ${activeBlock.value?.id} not found.`);
    }
  };

  const addPolygonData = (key: string) => {
    if (!activeBlock.value) return;

    if (!activeBlock.value.polygon_data) {
      activeBlock.value.polygon_data = [];
    }

    const newPolygonData: PolygonDataCollection = {
      id: "",
      key: key,
      type: ""
    };

    activeBlock.value.polygon_data.push(newPolygonData);
  };

  const removePoligonItem = (key: string) => {
    if (!activeBlock.value || !activeBlock.value.polygon_data) {
      console.error("No active floor to remove polygon data from.");
      return;
    }

    if (activeBlock.value.polygon_data) {
      const index = activeBlock.value.polygon_data.findIndex((item) => item.key === key);
      if (index !== -1) {
        activeBlock.value.polygon_data.splice(index, 1);
      } else {
        console.warn(`Polygon item with key "${key}" not found.`);
      }
    }
  };

  const fetchProjectBLocks = async (id: number) => {
    const { data } = await ajaxAxios.post("", {
      action: "get_blocks",
      nonce: irePlugin.nonce,
      project_id: id,
      per_page: 99999
    });

    if (!data.success) {
      return;
    }

    projectBlocks.value = data.data?.data;
  };

  watch(
    () => activeBlock.value?.svg,
    () => {
      if (!activeBlock.value) {
        return;
      }

      activeBlock.value.svg = transformSvgString(activeBlock.value.svg);
      //  transformSvgString(active);
    },
    { immediate: true }
  );

  return {
    projectBlocks,
    activeBlock,
    setActiveBlock,
    activeBlockGroup,
    blockSvgRef,
    addPolygonData,
    removePoligonItem,
    editpoligonData,
    fetchProjectBLocks
  };
});
