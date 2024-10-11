import { defineStore } from "pinia";
import { ref } from "vue";
import { ActionItem, TypeItem } from "../../types/components";
import ajaxAxios from "../utils/axios";

export const useActionsStore = defineStore("actions", () => {

  const projectActions = ref<ActionItem[]>();

  const fetchProjectActions = async (id: number) => {
    const { data } = await ajaxAxios.post("", {
      action: "ire_get_tooltip",
      nonce: irePlugin.nonce,
      project_id: id,
      per_page: 99999
    });


    if (!data.success) {
      return;
    }

    projectActions.value = data?.data;
  };

  return {
    projectActions,
    fetchProjectActions
  };
});
