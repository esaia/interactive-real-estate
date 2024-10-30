<script setup lang="ts">
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import { onMounted, ref } from "vue";
import Input from "../../form/Input.vue";

const projectStore = useProjectStore();

const shortcodeData = ref();
const imgPathsData = ref<any>({});

const fetchData = async () => {
  const { data } = await ajaxAxios.post("", {
    action: "get_shortcode_data",
    nonce: irePlugin.nonce,
    project_id: projectStore?.id || 83,
    block: "all"
  });

  if (data.success) {
    shortcodeData.value = data.data;
  }
};

const saveLocalStorage = (e: Event, key: string) => {
  const value = (e.target as HTMLInputElement).value;

  // const data = localStorage.getItem("imagePaths");
  // const imgPaths = data ? JSON.parse(data) : {};

  imgPathsData.value[key] = value;

  localStorage.setItem("imagePaths", JSON.stringify(imgPathsData.value));
  imgPathsData.value = imgPathsData.value;
};

onMounted(async () => {
  await fetchData();

  const data = localStorage.getItem("imagePaths");
  const imgPaths = data ? JSON.parse(data) : {};
  imgPathsData.value = imgPaths;

  shortcodeData.value.project.project_image[0] = { url: imgPathsData.value["project image"] || "" };

  shortcodeData.value.floors = shortcodeData.value.floors.map((item: any) => {
    return { ...item, floor_image: [{ url: imgPathsData.value["floor " + item.floor_number] || "" }] };
  });

  shortcodeData.value.types = shortcodeData.value.types.map((item: any) => {
    return {
      ...item,
      image_2d: [{ url: imgPathsData.value[item.title + " 2d"] || "" }],
      image_3d: [{ url: imgPathsData.value[item.title + " 3d"] || "" }]
    };
  });
});
</script>

<template>
  <div v-if="shortcodeData" class="overflow-scroll">
    <div class="flex flex-col gap-4 p-4">
      <Input
        v-model="shortcodeData.project.project_image[0].url"
        label="project image"
        placeholder="https:// or /assets/images/project.jpg"
        @change="(e: Event) => saveLocalStorage(e, 'project image')"
      />

      <div class="h-[1px] w-full bg-gray-100"></div>

      <div class="grid grid-cols-2 gap-2">
        <Input
          v-for="item in shortcodeData.floors"
          v-model="item.floor_image[0].url"
          :label="'floor ' + item.floor_number"
          placeholder="https:// or /assets/images/floor_1.jpg"
          @change="(e: Event) => saveLocalStorage(e, 'floor ' + item.floor_number)"
        />
      </div>

      <div class="h-[1px] w-full bg-gray-100"></div>

      <div v-for="item in shortcodeData.types" class="grid grid-cols-2 gap-2">
        <Input
          v-model="item.image_2d[0].url"
          :label="item.title + ' 2d'"
          placeholder="https:// or /assets/images/image_2d.jpg"
          @change="(e: Event) => saveLocalStorage(e, item.title + ' 2d')"
        />
        <Input
          v-model="item.image_3d[0].url"
          :label="item.title + ' 3d'"
          placeholder="https:// or /assets/images/image_3d.jpg"
          @change="(e: Event) => saveLocalStorage(e, item.title + ' 3d')"
        />
      </div>

      <div class="[&_code]:cursor-text [&_code]:!bg-gray-100">
        <p class="!py-4">
          1. Paste the following code snippet within the <span class="highlight"> &lt;head&gt;</span> tag of your HTML
          document.
        </p>

        <div>
          <highlightjs
            language="markdown"
            code="<script src='https://unpkg.com/vue@3.5.12/dist/vue.global.prod.js'></script>;
<link rel='stylesheet' crossorigin href='/dist/styles.css' />'"
          />
        </div>

        <p class="!py-4">2. Paste this HTML code in your page, where you want the interactive building to appear.</p>

        <div>
          <highlightjs language="markdown" code="<div id='project-1'></div>" />
        </div>

        <p class="!py-4">3. Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe, dignissimos.</p>

        <div>
          <highlightjs
            language="js"
            code="<script type='module'>
   import { Project } from './dist/lib.es.js';

   function addProject(selector, shortcodeData) {
      const app = Vue.createApp({
          components: {
            Project,
          },
          data() {
            return {
            shortcodeData,
            };
          },
          template: `<Project :data='shortcodeData' />`,
      });

      app.mount(selector);
   }



   addProject('#project-1', data);
   // addProject('#project-2', data); Add as many project as you want
</script>
"
          />
        </div>

        <textarea
          v-if="shortcodeData"
          :value="JSON.stringify(shortcodeData, null, 2)"
          class="highlight mt-4 min-h-80 w-full border-none outline-none focus:border-none focus:outline-none focus:ring-0"
          readonly
        ></textarea>
        <!-- <Button title="copy data" @click="console.log(shortcodeData)" /> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.highlight {
  @apply my-2 cursor-text rounded-sm bg-gray-100 p-2 outline-none;
}
</style>
