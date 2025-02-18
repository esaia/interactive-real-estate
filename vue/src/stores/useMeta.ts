import { defineStore } from "pinia";
import { ref } from "vue";
import { ProjectMeta } from "../../types/components";
import ajaxAxios from "@/src/utils/axios";
import { useProjectStore } from "./useProject";

export const useMetaStore = defineStore("meta", () => {
  const {
    PREVIEW_PATH_COLOR,
    PREVIEW_PATH_HOVER_COLOR,
    PREVIEW_RESERVED_COLOR,
    PREVIEW_SOLD_COLOR,
    PREVIEW_STROKE_COLOR,
    PREVIEW_STROKE_WIDTH,
    PREVIEW_BORDER_RADIUS
  } = constants;

  const projectStore = useProjectStore();

  const projectMeta = ref<ProjectMeta[]>([]);

  const getProjectMeta = async () => {
    const { data } = await ajaxAxios.post("", {
      action: "irep_get_meta",
      nonce: irePlugin.nonce,
      project_id: projectStore.id
    });
    if (data?.success) {
      projectMeta.value = data.data;
      setColorsMeta();
    }
  };

  const getMeta = (metaKey: string) => {
    return projectMeta.value.find((item) => item.meta_key === metaKey);
  };

  const setProjectMeta = async (metaArr: { key: string; value: any }[], projectId?: number) => {
    await ajaxAxios.post("", {
      action: "irep_create_or_update_meta",
      nonce: irePlugin.nonce,
      project_id: projectId || projectStore.id,
      meta_data: metaArr
    });

    getProjectMeta();
  };

  const setColorsMeta = () => {
    const path_color = getMeta("path_color")?.meta_value || PREVIEW_PATH_COLOR;
    const path_hover_color = getMeta("path_hover_color")?.meta_value || PREVIEW_PATH_HOVER_COLOR;
    const reserved_color = getMeta("reserved_color")?.meta_value || PREVIEW_RESERVED_COLOR;
    const sold_color = getMeta("sold_color")?.meta_value || PREVIEW_SOLD_COLOR;
    const stroke_color = getMeta("stroke_color")?.meta_value || PREVIEW_STROKE_COLOR;
    const stroke_width = !irePlugin.is_premium ? 1 : getMeta("stroke_width")?.meta_value || PREVIEW_STROKE_WIDTH;
    const border_radius = !irePlugin.is_premium ? 1 : getMeta("border_radius")?.meta_value || PREVIEW_BORDER_RADIUS;

    const colors: any = {
      path_color,
      path_hover_color,
      reserved_color,
      sold_color,
      stroke_color,
      stroke_width,
      border_radius
    };

    projectMeta.value = projectMeta.value.map((item) => {
      if (Object.keys(colors).includes(item.meta_key) && !item.meta_value) {
        return { ...item, meta_value: colors[item.meta_key] };
      } else {
        return item;
      }
    });
  };

  return {
    projectMeta,
    getProjectMeta,
    setProjectMeta,
    getMeta
  };
});
