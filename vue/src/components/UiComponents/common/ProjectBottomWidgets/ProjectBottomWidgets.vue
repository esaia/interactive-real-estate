<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useProjectStore } from "../../../../stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import { pushToPlansPage, resetCanvasAfterSave, showToast, toBase64 } from "@/src/composables/helpers";
import { onMounted, ref, watch } from "vue";
import { imageInterface } from "@/types/components";
import UploadImg from "../../form/UploadImg.vue";
import Input from "../../form/Input.vue";
import Button from "../../form/Button.vue";
import ColorVariables from "./ColorVariables.vue";
import { useMetaStore } from "@/src/stores/useMeta";
import Modal from "../../Modal.vue";
import GenerateObject from "./GenerateObject.vue";
import TooltipChoose from "./TooltipChoose.vue";
import CurrencySelect from "../CurrencySelect.vue";
import Checkbox from "../../form/Checkbox.vue";
const projectStore = useProjectStore();
const metaStore = useMetaStore();

const { id, title, slug, polygon_data, svgRef, activeGroup, project_image } = storeToRefs(projectStore);

const projectImage = ref<imageInterface[] | null>(null);
const colorsRef = ref();
const chosenTooltip = ref("1");
const chosenCurrency = ref({ title: "🇺🇸 USD - $", value: "usd" });
const isPriceRounded = ref(false);
const openReservedFlats = ref(false);
const openSoldFlats = ref(false);

const shortcode = ref(`[irep_project id="${projectStore?.id}"]`);
const showGenerateObject = ref(false);
const showPreview = ref(false);
const projectUpdateToogle = ref(false);
const loading = ref(false);

const updateProject = async () => {
  // const tooltipMeta = { key: "tooltip", value: chosenTooltip.value };
  // const currencyMeta = { key: "currency", value: chosenCurrency.value.value };
  // const isRoundedPrice = { key: "price_rounded", value: isPriceRounded.value };
  // const openReservedFlatMeta = { key: "openReservedFlat", value: openReservedFlats.value };
  // const openSoldFlatMeta = { key: "openSoldFlat", value: openSoldFlats.value };

  const metas = [
    { key: "tooltip", value: chosenTooltip.value },
    { key: "currency", value: chosenCurrency.value.value },
    { key: "price_rounded", value: isPriceRounded.value },
    { key: "open_reserved_flat", value: openReservedFlats.value },
    { key: "open_sold_flat", value: openSoldFlats.value }
  ];

  metaStore.setProjectMeta([...colorsRef.value?.metaColors, ...metas]);

  if (svgRef.value) {
    resetCanvasAfterSave(svgRef.value);
  }

  const svgElement = svgRef.value?.querySelector("svg");

  const svgBase64 = await toBase64(svgElement);

  const params: any = {
    projectId: id.value,
    title: title.value,
    slug: slug.value,
    svg: svgBase64,
    // svg: svgRef.value?.querySelector("svg")?.outerHTML || "",
    polygon_data: polygon_data.value
  };

  if (project_image.value) {
    params.project_image = project_image.value.id;
  }

  loading.value = true;

  try {
    const { data } = await ajaxAxios.post("", {
      action: "irep_update_project",
      nonce: irePlugin.nonce,
      ...params
    });

    if (data?.success) {
      projectUpdateToogle.value = !projectUpdateToogle.value;
      activeGroup.value = null;
      showToast("success", "Project Updated!");
    } else {
      showToast("error", "Something went wrong!");
    }
  } catch (error) {
    showToast("error", "Something went wrong!");
  }

  loading.value = false;
};

watch(
  () => showPreview.value,
  () => {
    if (!showPreview.value) {
      projectStore.fetchProjects(projectStore.id);
    }
  }
);

watch(
  () => projectImage.value,
  async (ns) => {
    if (ns) {
      project_image.value = ns[0];
    }
  }
);

watch(
  () => metaStore.projectMeta,
  () => {
    chosenTooltip.value = metaStore.getMeta("tooltip")?.meta_value.toString() || "1";

    const activeCurrency = metaStore.getMeta("currency")?.meta_value.toString() || "usd";
    const findedCurency = metaStore.currencyData.find((item) => item.value === activeCurrency);
    if (findedCurency) {
      chosenCurrency.value = findedCurency;
    }

    isPriceRounded.value = metaStore.getMeta("price_rounded")?.meta_value === "true";
    openReservedFlats.value = metaStore.getMeta("open_reserved_flat")?.meta_value === "true";
    openSoldFlats.value = metaStore.getMeta("open_sold_flat")?.meta_value === "true";
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  projectImage.value = project_image.value?.id ? [project_image.value] : null;
});

defineExpose({
  showPreview,
  projectUpdateToogle
});
</script>

<template>
  <div class="my-7 flex items-start justify-between">
    <div v-if="!showPreview" class="flex flex-wrap gap-5">
      <div class="flex flex-col items-start gap-5 rounded-md bg-white p-4">
        <div class="flex w-full flex-col gap-2">
          <Input v-model="title" label="Project Title:" class="w-full [&_p]:font-bold" />
        </div>

        <div>
          <Input
            v-model="shortcode"
            class="w-full [&_input]:cursor-text disabled:[&_input]:text-black/60 [&_p]:font-semibold"
            label="Shortcode:"
            disabled
          />
        </div>

        <a href="https://youtu.be/dQmqouszdK0" target="_blank" class="animate-pulse underline">
          Watch video tutorial
        </a>

        <a href="https://interactive-real-estate.vercel.app" target="_blank" class="animate-pulse underline">
          Our website
        </a>

        <a
          href="https://wordpress.org/support/plugin/interactive-real-estate/reviews/#new-post"
          target="_blank"
          class="animate-pulse underline"
        >
          Give us a review ⭐ 🙏
        </a>

        <!-- <div class="cursor-pointer hover:underline" @click="showGenerateObject = true">
          Generate data for standalone version
        </div> -->
      </div>

      <div class="w-60 rounded-md bg-white p-4">
        <UploadImg
          v-model="projectImage"
          title="Upload project image"
          :example-image="irePlugin?.plugin_assets_path + 'exampleImages/mainRender.jpg'"
          required
        />
        <p class="mt-2 text-red-700">
          <span class="font-semibold">IMPORTANT:</span> Changing the image may cause svg paths mismatches.
        </p>

        <div class="mt-3">
          <CurrencySelect v-model="chosenCurrency" />
        </div>

        <div class="mt-3 space-y-2">
          <Checkbox v-model="isPriceRounded" title="Rounded Price" />
          <Checkbox v-model="openReservedFlats" title="Open reserved flats" />
          <Checkbox v-model="openSoldFlats" title="Open sold flats" />
        </div>
      </div>

      <div class="relative overflow-hidden rounded-md bg-white p-4">
        <ColorVariables ref="colorsRef" />
        <div
          v-if="!irePlugin?.is_premium"
          class="absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center bg-gray-100/80"
          @click="pushToPlansPage()"
        >
          <p class="-rotate-12 text-center text-xl font-bold text-red-700">Upgrade to change path colors</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-md bg-white p-4">
        <TooltipChoose v-model="chosenTooltip" />
      </div>
    </div>

    <div class="flex flex-1 flex-col items-end gap-3">
      <div class="flex items-center gap-4">
        <Button title="preview" outlined @click="showPreview = !showPreview" class="w-fit" />
        <Button title="Update" outlined @click="updateProject" :loading="loading" />
      </div>
    </div>
  </div>

  <teleport to="#irep-vue-app">
    <Transition name="fade">
      <Modal :show="showGenerateObject" type="2" @close="showGenerateObject = false">
        <GenerateObject />
      </Modal>
    </Transition>
  </teleport>
</template>
