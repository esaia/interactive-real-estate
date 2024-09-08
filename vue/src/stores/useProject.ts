import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { PolygonDataCollection, ProjectInterface } from "../../types/components";
import { transformSvgString } from "../composables/helpers";

export const useProjectStore = defineStore("project", () => {
  const id = ref("");
  const title = ref("");
  const svg = ref("");
  const project_image = ref("");
  const slug = ref("");
  const polygon_data = ref<PolygonDataCollection>();

  const created_at = ref("");
  const updated_at = ref("");

  const svgRef = ref<HTMLDivElement | null>(null);
  const activeGroup = ref<SVGGElement | null>(null);

  const addPoligonData = (key: string) => {
    polygon_data.value = {
      ...polygon_data.value,
      [key]: {
        id: "",
        key,
        type: ""
      }
    };
  };

  const removePoligonItem = (key: string) => {
    if (!key || !polygon_data.value) return;

    const { [key]: _, ...rest } = polygon_data.value;
    polygon_data.value = rest;
  };

  const transformedTitle = computed(() => {
    return transformSvgString(svg.value);
  });

  const setProject = (project: ProjectInterface) => {
    id.value = project.id;
    title.value = project.title || "";
    svg.value = project.svg || "";
    project_image.value = project.project_image || "";
    slug.value = project.slug || "";
    polygon_data.value = project.polygon_data || "";

    created_at.value = project.created_at || "";
    updated_at.value = project.updated_at || "";
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
    addPoligonData,
    removePoligonItem,
    setProject
  };
});
