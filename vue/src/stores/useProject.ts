import { defineStore } from "pinia";
import { compile, computed, onMounted, ref } from "vue";
import { PolygonDataCollection, ProjectInterface } from "../../types/components";
import { transformSvgString } from "../composables/helpers";

export const useProjectStore = defineStore("project", () => {
  const id = ref("");
  const title = ref("");
  const svg = ref("");
  const project_image = ref("");
  const slug = ref("");
  const polygonData = ref<PolygonDataCollection>();

  const created_at = ref("");
  const updated_at = ref("");

  const addPoligonData = (key: string) => {
    polygonData.value = {
      ...polygonData.value,
      [key]: {
        id: "",
        key,
        type: ""
      }
    };
  };

  const transformedTitle = computed(() => {
    return transformSvgString(svg.value);
  });

  const setSvg = (svgEl: SVGElement) => {
    svg.value = svgEl.outerHTML;

    // svg.value = new XMLSerializer().serializeToString(svgEl);
  };

  const setProject = (project: ProjectInterface) => {
    id.value = project.id;
    title.value = project.title || "";
    svg.value = project.svg || "";
    project_image.value = project.project_image || "";
    slug.value = project.slug || "";
    polygonData.value = project.polygon_data || "";

    created_at.value = project.created_at || "";
    updated_at.value = project.updated_at || "";
  };

  return {
    id,
    title,
    svg: transformedTitle,
    project_image,
    slug,
    polygonData,
    created_at,
    updated_at,
    addPoligonData,
    setSvg,
    setProject
  };
});
