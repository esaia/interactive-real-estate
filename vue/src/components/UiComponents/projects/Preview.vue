<script setup lang="ts">
import { transformSvgString } from "@/src/composables/helpers";
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import { FlatItem, FloorItem, ShortcodeData } from "@/types/components";
import { computed, onMounted, ref, watch } from "vue";

const colors = {
  reserved: "yellow",
  sold: "red",
  path_hover: "green",
  path: "#b0a6c4"
};

const cssVariables = {
  "--reserved-color": colors.reserved,
  "--sold-color": colors.sold,
  "--path-hover-color": colors.path_hover,
  "--path-color": colors.path
};

const projectStore = useProjectStore();

const shortcodeData = ref<ShortcodeData>();
const hoveredSvg = ref<HTMLElement>();
const type = ref<"" | "floor" | "flat" | "block">("");
const hoveredData = ref();

const project = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.project;
});

const floors = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.floors;
});

const flats = computed(() => {
  if (!shortcodeData.value) return;

  return shortcodeData.value.flats;
});

const projectSvg = computed(() => {
  if (!project.value) return;

  return transformSvgString(project.value.svg);
});

const fetchData = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_shortcode_data",
    nonce: irePlugin.nonce,
    project_id: projectStore.id
  });

  if (data.success) {
    shortcodeData.value = data.data;
  }
};

const onSvgMouseOver = (e: any) => {
  const target: HTMLElement | null = e.target;

  if (target) {
    hoveredSvg.value = target;
  }
};

watch(
  () => hoveredSvg.value,
  (ns) => {
    if (!ns) return;

    const activeG = ns.parentElement;

    if (activeG && activeG.nodeName === "g") {
      const id = activeG.getAttribute("id");
      if (!id) return;
      const activePolygon = project.value?.polygon_data.find((item) => item.key === id);
      if (!activePolygon) return;

      type.value = activePolygon?.type || "";

      switch (activePolygon?.type) {
        case "floor":
          const activeFloor = floors.value?.find((floor) => floor.id === activePolygon.id);
          hoveredData.value = activeFloor;
          break;

        default:
          break;
      }
    } else {
      type.value = "";
    }
  }
);

watch(
  () => hoveredData.value,
  () => {
    if (type.value === "floor") {
      if (
        hoveredData.value.flats?.length &&
        hoveredData.value.flats.every((flat: FlatItem) => flat.conf === "reserved")
      ) {
        hoveredData.value.conf = "reserved";
      } else if (
        hoveredData.value.flats?.length &&
        hoveredData.value.flats.every((flat: FlatItem) => flat.conf === "sold")
      ) {
        hoveredData.value.conf = "sold";
      }
    }
  }
);

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="relative h-full select-none overflow-hidden bg-gray-50 pt-[50%]" :style="cssVariables">
    <img :src="shortcodeData?.project.project_image" alt="" class="absolute left-0 top-0 h-full w-full object-cover" />
    <div
      class="absolute left-0 top-0 h-full w-full [&_path]:cursor-pointer [&_path]:fill-[var(--path-color)] [&_path]:transition-all"
      :class="[
        {
          'hover:[&_path]:fill-[var(--reserved-color)]': hoveredData?.conf === 'reserved',
          'hover:[&_path]:fill-[var(--sold-color)]': hoveredData?.conf === 'sold',
          'hover:[&_path]:fill-[var(--path-hover-color)]': !hoveredData?.conf
        }
      ]"
      v-html="projectSvg"
      :key="projectSvg"
      @mouseover="onSvgMouseOver"
    ></div>

    <Transition name="fade-in-out">
      <div v-if="type === 'floor'" class="absolute bottom-5 right-5 flex items-center gap-3 bg-white p-4">
        <div class="flex flex-col items-center">
          <p class="text-lg">
            {{ (hoveredData as FloorItem).floor_number }}
          </p>

          <p>Floor</p>
        </div>

        <div v-if="hoveredData?.conf || hoveredData.flats.length" class="bg-gray-100 p-3">
          <div v-if="hoveredData?.conf" class="text-lg">
            {{ hoveredData.conf }}
          </div>
          <div v-else>
            <div v-if="hoveredData?.counts?.available" class="flex items-center gap-2">
              <p class="min-w-3 text-lg">
                {{ hoveredData?.counts?.available || 0 }}
              </p>
              <p>Available</p>
            </div>

            <div v-if="hoveredData?.counts?.reserved" class="flex items-center gap-2">
              <p class="min-w-3 text-lg">
                {{ hoveredData.counts.reserved }}
              </p>
              <p>Reserved</p>
            </div>

            <div v-if="hoveredData?.counts?.sold" class="flex items-center gap-2">
              <p class="min-w-3 text-lg">
                {{ hoveredData.counts.sold }}
              </p>
              <p>Sold</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
