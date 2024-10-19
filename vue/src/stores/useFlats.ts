import { defineStore } from "pinia";
import { ref } from "vue";
import { FlatItem } from "../../types/components";
import ajaxAxios from "../utils/axios";

export const useFlatsStore = defineStore("flats", () => {
  const projectFlats = ref<FlatItem[]>();

  const fetchProjectFlats = async (id: number) => {
    const { data } = await ajaxAxios.post("", {
      action: "ire_get_flats",
      nonce: irePlugin.nonce,
      project_id: id,
      per_page: 99999,
      block: "all"
    });

    if (!data.success) {
      return;
    }

    projectFlats.value = data.data?.data;
  };

  return {
    projectFlats,
    fetchProjectFlats
  };
});
