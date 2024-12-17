import { defineStore } from "pinia";
import { computed, ref } from "vue";
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
    PREVIEW_STROKE_WIDTH
  } = constants;

  const projectStore = useProjectStore();

  const projectMeta = ref<ProjectMeta[]>([]);

  const isContainImage = computed(() => {
    const findMeta = projectMeta.value?.find((item) => item.meta_key === "project_img_contain")?.meta_value?.toString();
    return JSON.parse(findMeta || "false");
  });

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

  const setProjectMeta = async (metaArr: { key: string; value: any }[]) => {
    await ajaxAxios.post("", {
      action: "irep_create_or_update_meta",
      nonce: irePlugin.nonce,
      project_id: projectStore.id,
      meta_data: metaArr
    });

    getProjectMeta();
  };

  const setColorsMeta = () => {
    const path_color = getMeta("path_color");
    const path_hover_color = getMeta("path_hover_color");
    const reserved_color = getMeta("reserved_color");
    const sold_color = getMeta("sold_color");
    const stroke_color = getMeta("stroke_color");
    const stroke_width = getMeta("stroke_width");

    const arr: ProjectMeta[] = [];

    if (path_color) {
      arr.push({
        project_id: projectStore.id,
        meta_key: "path_color",
        meta_value: path_color.toString()
      });
    } else {
      arr.push({
        project_id: projectStore.id,
        meta_key: "path_color",
        meta_value: PREVIEW_PATH_COLOR
      });
    }

    if (path_hover_color) {
      arr.push({
        project_id: projectStore.id,
        meta_key: "path_hover",
        meta_value: path_hover_color.toString()
      });
    } else {
      arr.push({
        project_id: projectStore.id,
        meta_key: "path_hover",
        meta_value: PREVIEW_PATH_HOVER_COLOR
      });
    }

    if (reserved_color) {
      arr.push({
        project_id: projectStore.id,
        meta_key: "reserved_color",
        meta_value: reserved_color.toString()
      });
    } else {
      arr.push({
        project_id: projectStore.id,
        meta_key: "reserved_color",
        meta_value: PREVIEW_RESERVED_COLOR
      });
    }

    if (sold_color) {
      arr.push({
        project_id: projectStore.id,
        meta_key: "sold_color",
        meta_value: sold_color.toString()
      });
    } else {
      arr.push({
        project_id: projectStore.id,
        meta_key: "sold_color",
        meta_value: PREVIEW_SOLD_COLOR
      });
    }

    if (stroke_color) {
      arr.push({
        project_id: projectStore.id,
        meta_key: "stroke_color",
        meta_value: stroke_color.toString()
      });
    } else {
      arr.push({
        project_id: projectStore.id,
        meta_key: "stroke_color",
        meta_value: PREVIEW_STROKE_COLOR
      });
    }

    if (stroke_width) {
      arr.push({
        project_id: projectStore.id,
        meta_key: "stroke_width",
        meta_value: Number(stroke_width)
      });
    } else {
      arr.push({
        project_id: projectStore.id,
        meta_key: "stroke_width",
        meta_value: PREVIEW_STROKE_WIDTH
      });
    }

    projectMeta.value = [...projectMeta.value, ...arr];
  };

  return {
    projectMeta,
    getProjectMeta,
    isContainImage,
    setProjectMeta,
    getMeta
  };
});
