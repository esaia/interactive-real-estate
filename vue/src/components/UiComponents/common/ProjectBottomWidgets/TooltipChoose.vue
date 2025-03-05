<script setup lang="ts">
import { ref } from "vue";
import Radio from "../../form/Radio.vue";
import Info from "../../icons/Info.vue";
import Modal from "../../Modal.vue";

const tooltipModel = defineModel();

const showTooltipImage = ref(false);
const activeTooltipindex = ref(-1);

const infoMouseEnter = (index: number) => {
  showTooltipImage.value = true;
  activeTooltipindex.value = index;
};
const infoMouseLeave = () => {
  showTooltipImage.value = false;
  activeTooltipindex.value = -1;
};
</script>

<template>
  <div class="relative flex w-full max-w-sm flex-col rounded-xl bg-white shadow">
    <div class="flex min-w-[240px] flex-col gap-1 p-2">
      <label
        v-for="i in 3"
        class="flex w-full cursor-pointer flex-col items-start overflow-hidden rounded-lg p-0 transition-all hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"
      >
        <div class="inline-flex w-full items-center justify-between p-2">
          <Radio v-model="tooltipModel" :label="`Tooltip ${i}`" name="tooltip" :value="i.toString()" />

          <div class="flex cursor-pointer justify-end" @mouseenter="infoMouseEnter(i)" @mouseleave="infoMouseLeave">
            <Info />
          </div>
        </div>
      </label>
    </div>

    <teleport to="#irep-vue-app">
      <Transition name="fade-in-out">
        <Modal :show="showTooltipImage" :show-close-btn="false">
          <div>
            <p class="!mb-2">Tooltip {{ activeTooltipindex }}:</p>
            <img
              :src="irePlugin?.plugin_assets_path + `exampleImages/tooltip_${activeTooltipindex}.png`"
              alt=""
              class="w-full"
            />
          </div>
        </Modal>
      </Transition>
    </teleport>
  </div>
</template>
