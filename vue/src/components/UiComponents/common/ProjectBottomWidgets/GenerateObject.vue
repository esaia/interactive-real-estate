<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useProjectStore } from "@/src/stores/useProject";
import ajaxAxios from "@/src/utils/axios";
import Input from "../../form/Input.vue";
import Loading from "../Loading.vue";

const projectStore = useProjectStore();

const shortcodeData = ref();
const imgPathsData = ref<any>({});
const loading = ref(false);

const actionModals = computed(() => {
  return shortcodeData.value.actions.filter((item: any) => item.data?.actionType === "modal");
});

const isSomeFlatManualType = computed(() => {
  return shortcodeData.value?.flats?.some((item: any) => !item?.use_type);
});

const fetchData = async () => {
  loading.value = true;
  const { data } = await ajaxAxios.post("", {
    action: "get_shortcode_data",
    nonce: irePlugin.nonce,
    project_id: projectStore?.id,
    block: "all"
  });

  if (data.success) {
    shortcodeData.value = data.data;
  }
  loading.value = false;
};

const saveLocalStorage = (e: Event, key: string) => {
  const value = (e.target as HTMLInputElement).value;
  imgPathsData.value[key] = value;

  localStorage.setItem("imagePaths-" + projectStore.id, JSON.stringify(imgPathsData.value));
  imgPathsData.value = imgPathsData.value;
};

onMounted(async () => {
  await fetchData();

  const data = localStorage.getItem("imagePaths-" + projectStore.id);
  const imgPaths = data ? JSON.parse(data) : {};
  imgPathsData.value = imgPaths;

  shortcodeData.value.project.project_image[0] = { url: imgPathsData.value["project image"] || "" };

  shortcodeData.value.floors = shortcodeData.value.floors?.map((item: any) => {
    return {
      ...item,
      floor_image: [
        {
          url:
            imgPathsData.value["floor " + item.floor_number + (item?.block_id ? " block_id: " + item.block_id : "")] ||
            ""
        }
      ]
    };
  });

  shortcodeData.value.blocks = shortcodeData.value.blocks?.map((item: any) => {
    return { ...item, block_image: [{ url: imgPathsData.value[item.title] || "" }] };
  });

  shortcodeData.value.flats = shortcodeData.value.flats?.map((flat: any) => {
    if (flat?.use_type) {
      return { ...flat, type: null };
    }

    const { image_2d, image_3d } = flat?.type || {};

    return {
      ...flat,
      type: {
        ...flat?.type,
        image_2d: Array.isArray(image_2d)
          ? image_2d.map((item: any, i: number) => ({
              url: imgPathsData.value[`flat: ${flat.id} | 2d | ${i + 1}`] || ""
            }))
          : [],
        image_3d: Array.isArray(image_3d)
          ? image_3d.map((item: any, i: number) => ({
              url: imgPathsData.value[`flat: ${flat.id} | 3d | ${i + 1}`] || ""
            }))
          : []
      }
    };
  });

  shortcodeData.value.types = shortcodeData.value.types?.map((type: any) => {
    return {
      ...type,
      image_2d: type.image_2d?.map((item: any, i: number) => {
        return { url: imgPathsData.value[`${type.title} | 2d | ${i + 1}`] || "" };
      }),
      image_3d: type.image_3d?.map((item: any, i: number) => {
        return { url: imgPathsData.value[`${type.title} | 3d | ${i + 1}`] || "" };
      })
    };
  });

  shortcodeData.value.actions = shortcodeData.value.actions?.map((item: any) => {
    if (item.data.actionType === "modal") {
      item.data.modalObject.modalImage = [{ url: imgPathsData.value[`modal ${item.id}`] || "" }];
    }
    return item;
  });
});
</script>

<template>
  <div v-if="loading">
    <Loading />
  </div>
  <div v-else-if="shortcodeData">
    <div class="flex flex-col gap-6 p-4">
      <p>
        Because you are using an standalone environment, you need to specify the image addresses as either relative or
        absolute.
      </p>

      <div>
        <h4 class="title-sm">Project</h4>

        <Input
          v-model="shortcodeData.project.project_image[0].url"
          label="project image"
          placeholder="https:// or /assets/images/project.jpg"
          @change="(e: Event) => saveLocalStorage(e, 'project image')"
        />
      </div>

      <div v-if="shortcodeData.blocks?.length">
        <div class="mb-4 h-[1px] w-full bg-gray-100"></div>

        <h4 class="title-sm">Blocks</h4>

        <div class="grid grid-cols-2 gap-4">
          <Input
            v-for="item in shortcodeData.blocks"
            v-model="item.block_image[0].url"
            :label="item.title"
            placeholder="https:// or /assets/images/block_1.jpg"
            @change="(e: Event) => saveLocalStorage(e, item.title)"
          />
        </div>
      </div>

      <div v-if="shortcodeData.floors?.length">
        <div class="mb-4 h-[1px] w-full bg-gray-100"></div>

        <h4 class="title-sm">Floors</h4>

        <div class="grid grid-cols-2 gap-4">
          <Input
            v-for="item in shortcodeData.floors"
            v-model="item.floor_image[0].url"
            :label="'floor ' + item.floor_number + (item?.block_id ? ' block_id: ' + item.block_id : '')"
            placeholder="https:// or /assets/images/floor_1.jpg"
            @change="
              (e: Event) =>
                saveLocalStorage(
                  e,
                  'floor ' + item.floor_number + (item?.block_id ? ' block_id: ' + item.block_id : '')
                )
            "
          />
        </div>
      </div>

      <div v-if="shortcodeData.flats?.length && isSomeFlatManualType">
        <div class="mb-4 h-[1px] w-full bg-gray-100"></div>

        <h4 class="title-sm">Flats</h4>

        <p>label template: <span class="text-gray-400">Flat: {id} | {2d/3d} | {index}</span></p>
        <p class="!mb-4 text-gray-400">You can upload multiple images, that's why we use indexes</p>

        <div class="flex items-center text-center font-semibold">
          <div class="flex-1">
            <p>2d</p>
          </div>
          <div class="flex-1">
            <p>3d</p>
          </div>
        </div>

        <div v-for="item in shortcodeData.flats" class="[&_div]:last:border-none">
          <template v-if="!item.use_type">
            <div class="flex items-start gap-4 border-b-2 border-dashed border-b-gray-200 py-4">
              <div class="flex flex-1 flex-col gap-3">
                <Input
                  v-for="(image_2d, i) in item.type.image_2d"
                  v-model="image_2d.url"
                  :label="`flat: ${item.id} | 2d | ${i + 1}`"
                  placeholder="https:// or /assets/images/image_2d.jpg"
                  @change="(e: Event) => saveLocalStorage(e, `flat: ${item.id} | 2d | ${i + 1}`)"
                />
              </div>
              <div class="flex flex-1 flex-col gap-3">
                <Input
                  v-for="(image_3d, i) in item.type.image_3d"
                  v-model="image_3d.url"
                  :label="`flat: ${item.id} | 3d | ${i + 1}`"
                  placeholder="https:// or /assets/images/image_3d.jpg"
                  @change="(e: Event) => saveLocalStorage(e, `flat: ${item.id} | 3d | ${i + 1}`)"
                />
              </div>
            </div>
          </template>
        </div>
      </div>

      <div v-if="shortcodeData.types?.length">
        <div class="mb-4 h-[1px] w-full bg-gray-100"></div>

        <h4 class="title-sm">Types</h4>

        <p>label template: <span class="text-gray-400">${type title} | {2d/3d} | {index}</span></p>
        <p class="!mb-4 text-gray-400">You can upload multiple images, that's why we use indexes</p>
        <div class="flex items-center text-center font-semibold">
          <div class="flex-1">
            <p>2d</p>
          </div>
          <div class="flex-1">
            <p>3d</p>
          </div>
        </div>
        <div
          v-for="item in shortcodeData.types"
          class="flex items-start gap-4 border-b-2 border-dashed border-b-gray-200 py-4 last:border-none"
        >
          <div class="flex flex-1 flex-col gap-3">
            <Input
              v-for="(image_2d, i) in item.image_2d"
              v-model="image_2d.url"
              :label="`${item.title} | 2d | ${i + 1}`"
              placeholder="https:// or /assets/images/image_2d.jpg"
              @change="(e: Event) => saveLocalStorage(e, `${item.title} | 2d | ${i + 1}`)"
            />
          </div>

          <div class="flex flex-1 flex-col gap-3">
            <Input
              v-for="(image_3d, i) in item.image_3d"
              v-model="image_3d.url"
              :label="`${item.title} | 3d | ${i + 1}`"
              placeholder="https:// or /assets/images/image_3d.jpg"
              @change="(e: Event) => saveLocalStorage(e, `${item.title} | 3d | ${i + 1}`)"
            />
          </div>
        </div>
      </div>

      <div v-if="actionModals?.length">
        <div class="mb-4 h-[1px] w-full bg-gray-100"></div>

        <h4 class="title-sm">Actions</h4>

        <div class="grid grid-cols-2 gap-4">
          <Input
            v-for="item in actionModals"
            v-model="item.data.modalObject.modalImage[0].url"
            :label="'modal ' + item.id"
            placeholder="https:// or /assets/images/floor_1.jpg"
            @change="(e: Event) => saveLocalStorage(e, 'modal ' + item.id)"
          />
        </div>
      </div>

      <div class="[&_code]:cursor-text [&_code]:!bg-gray-100">
        <p class="!py-4">
          1. Paste the following code snippet within the <span class="highlight"> &lt;head&gt;</span> tag of your HTML
          document.
        </p>

        <div>
          <highlightjs
            language="markdown"
            code="<script src='https://unpkg.com/vue@3.5.12/dist/vue.global.prod.js'></script>
<link rel='stylesheet' crossorigin href='/dist/styles.css' />  <!-- Download these styles from codecanyon -->"
          />
        </div>

        <p class="!py-4">2. Paste this HTML code in your page, where you want the interactive building to appear.</p>

        <div>
          <highlightjs language="markdown" code="<div id='project-1'></div>" />
        </div>

        <p class="!py-4">3. Paste this script before the closing body tag.</p>

        <div>
          <highlightjs
            language="js"
            code="<script type='module'>
   import { Project } from './dist/lib.es.js'; // Download these script from codecanyon

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

    // You can see value of this variable below. This data is only for this project!
    const data = {
        project: {},
        floors: [],
        blocks: [],
        flats: [],
        types: [],
        meta: [],
        actions: [],
    }

   addProject('#project-1', data);
   // addProject('#project-2', data); Add as many project as you want
</script>
"
          />
        </div>

        <textarea
          v-if="shortcodeData"
          :value="'const data = ' + JSON.stringify(shortcodeData, null, 2)"
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

.title-sm {
  @apply !mb-2 !text-lg font-semibold tracking-tight;
}
</style>
