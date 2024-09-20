import { defineStore } from "pinia";
import { ref } from "vue";
import { TypeItem } from "../../types/components";
import ajaxAxios from "../utils/axios";
import { useProjectStore } from "./useProject";

export const useTypesStore = defineStore("types", () => {
  const projectStore = useProjectStore();

  const projectTypes = ref<TypeItem[]>();

  const fetchProjectTypes = async (id: number) => {
    const { data } = await ajaxAxios.post("", {
      action: "get_types",
      nonce: irePlugin.nonce,
      project_id: id,
      per_page: 99999
    });

    if (!data.success) {
      return;
    }

    projectTypes.value = data.data?.data;
  };

  return {
    projectTypes,
    fetchProjectTypes
  };
});
