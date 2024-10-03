import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { imageInterface, PolygonDataCollection, ProjectInterface } from "../../types/components";
import { transformSvgString } from "../composables/helpers";
import { useMetaStore } from "./useMeta";

export const useProjectStore = defineStore("project", () => {
  const metaStore = useMetaStore();

  const id = ref();
  const title = ref("");
  const svg = ref("");
  const project_image = ref<imageInterface | null>(null);
  const slug = ref("");
  const polygon_data = ref<PolygonDataCollection[]>([]);

  const created_at = ref("");
  const updated_at = ref("");

  const svgRef = ref<HTMLDivElement | null>(null);
  const activeGroup = ref<SVGGElement | null>(null);

  const addPolygonData = (key: string) => {
    polygon_data.value = [...polygon_data.value, { id: "", key, type: "" }];
  };

  const editpoligonData = (key: string, updatedData: PolygonDataCollection) => {
    const index = polygon_data.value.findIndex((polygon) => polygon.key === key);

    if (index !== -1) {
      polygon_data.value[index] = { ...polygon_data.value[index], ...updatedData };
    } else {
      console.error(`Polygon with id ${id} not found.`);
    }
  };

  const removePoligonItem = (key: string) => {
    if (!key || !polygon_data.value) return;

    polygon_data.value = polygon_data.value.filter((item) => item.key !== key);
  };

  const transformedTitle = computed(() => {
    return transformSvgString(svg.value);
  });

  const setProject = (project: ProjectInterface) => {
    id.value = +project.id;
    title.value = project.title || "";
    svg.value = project.svg || "";
    project_image.value = project.project_image[0] || null;
    slug.value = project.slug || "";
    polygon_data.value = project.polygon_data || "";
    created_at.value = project.created_at || "";
    updated_at.value = project.updated_at || "";

    metaStore.getProjectMeta();
  };

  return {
    id,
    title,
    svg: transformedTitle,
    project_image,
    slug,
    polygon_data,
    created_at,
    updated_at,
    svgRef,
    activeGroup,
    addPolygonData,
    editpoligonData,
    removePoligonItem,
    setProject
  };
});
