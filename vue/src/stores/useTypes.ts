import { defineStore } from "pinia";
import { ref } from "vue";
import { TypeItem } from "../../types/components";
import ajaxAxios from "../utils/axios";

export const useTypesStore = defineStore("types", () => {
  const projectTypes = ref<TypeItem[]>();

  const fetchProjectTypes = async (id: number) => {
    const { data } = await ajaxAxios.post("", {
      action: "ire_get_types",
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
